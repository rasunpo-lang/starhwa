import numpy as np
EDGE_L=(0.06,0.26,0.88,(0.985,0.99,1.0))
from PIL import Image
from scipy import ndimage as ndi
S='/private/tmp/claude-501/-Users-fanfanbinbin-Desktop/56c9ec8b-cf83-4cfd-9254-3066a105a200/scratchpad/'
def smooth(x,e0,e1):
    t=np.clip((x-e0)/(e1-e0),0,1); return t*t*(3-2*t)
def build(Hs=14.0,p=0.55,rh=7,theme='light',syn_mix=1.0,pad=20,up=2,base_gamma=1.25,light=(-0.55,-0.83),spec=0.28,RS=0.22,amp=1.0,mid_l=None,rim=0.0,sheen=0.0,cool=0.0,bandpow=6.0,bands=1.0,nmod=0.0,iri=0.0,spk=0,arm=14,edge_o=None,hi_o=None,skyref=0.0,spk_min=0.55,edge_d=None,mid_d=None,chrome=0.0,seg=0.0,sat=1.0,spk_tint=0.0,irip=1.3,glist=0,gseed=3,crop=True):
    im=Image.open(S+'starhwa-mark.orig.png').convert('RGBA')
    im=im.resize((im.width*up,im.height*up),Image.LANCZOS)
    arr=np.array(im).astype(np.float32)/255
    arr=np.pad(arr,((pad*up,pad*up),(pad*up,pad*up),(0,0)))
    a=arr[...,3]; rgb=arr[...,:3]
    lum=(rgb*[0.299,0.587,0.114]).sum(-1)
    M=a>0.5
    D=ndi.distance_transform_edt(M)
    H=ndi.maximum_filter(D,footprint=np.hypot(*np.mgrid[-rh:rh+1,-rh:rh+1])<=rh)
    Hp=np.where(H<Hs,Hs*np.power(np.maximum(H,1e-3)/Hs,p),H)
    g=np.where(M,np.maximum(Hp-H,0),0)
    do,idx=ndi.distance_transform_edt(~M,return_indices=True)
    gq=g[idx[0],idx[1]]
    newa=np.where(M,a,np.clip(gq-do+0.5,0,1))
    newa=np.maximum(newa,a)
    newa=np.clip(ndi.gaussian_filter(newa,0.6),0,1); newa=smooth(newa,0.05,0.75)
    M2=newa>0.5
    D2=ndi.distance_transform_edt(M2)
    H2=np.maximum(ndi.maximum_filter(D2,footprint=np.hypot(*np.mgrid[-rh:rh+1,-rh:rh+1])<=rh),1e-3)
    u=np.clip(D2/H2,0,1)
    Dg=ndi.gaussian_filter(D2,1.2); gy,gx=np.gradient(Dg)
    n=np.hypot(gx,gy)+1e-6; nx,ny=-gx/n,-gy/n            # outward normal
    s=nx*light[0]+ny*light[1]                            # >0 faces the light
    if theme=='light': edge,mid,hi,tint=EDGE_L
    else:              edge,mid,hi,tint=0.56,0.84,1.00,(1.0,0.99,0.975)
    if theme=='light':
        if edge_o is not None: edge=edge_o
        if mid_l is not None: mid=mid_l
    else:
        edge,mid=(edge_d,mid_d) if edge_d is not None else (edge,mid)
    if hi_o is not None: hi=hi_o
    prof=edge+(mid-edge)*smooth(u,0.0,0.6)
    ridge=np.exp(-((u-(0.66-0.22*s))/RS)**2)
    rng=np.random.RandomState(7); nz=ndi.gaussian_filter(rng.rand(*u.shape).astype(np.float32),22); nz=(nz-nz.min())/(nz.max()-nz.min()+1e-6)
    ridge=ridge*(1-nmod+2*nmod*nz)
    L=np.clip(prof+(hi-mid)*amp*ridge*smooth(u,0.15,0.5)+0.10*s*(1-u),0,1)
    # polished-silver light response: rim glint on the shadow-side edge + a soft
    # sheen band travelling across the whole mark (same for every stroke, so
    # the two characters read as one lit object)
    rimg=np.exp(-((u-0.16)/0.10)**2)*np.clip(-s,0,1)*rim
    yy,xx=np.mgrid[0:L.shape[0],0:L.shape[1]].astype(np.float32)
    ph=(xx*0.82+yy*0.57)/ (L.shape[1]*0.42)
    band=np.power(0.5+0.5*np.sin(2*np.pi*ph*bands+1.1),bandpow)
    L=np.clip(L+rimg+sheen*band*(0.35+0.65*smooth(u,0.1,0.7)),0,1)
    tintarr=np.array(tint)*(1-cool)+np.array([0.90,0.955,1.0])*cool
    syn=np.clip(L[...,None]*(tintarr*(0.86+0.14*L[...,None])),0,1)
    if chrome>0 or seg>0:
        rng2=np.random.RandomState(11)
        nz2=ndi.gaussian_filter(rng2.rand(*u.shape).astype(np.float32),13); nz2=(nz2-nz2.min())/(nz2.max()-nz2.min()+1e-6)
        nz2=smooth(nz2,0.25,0.75)
        b1=np.exp(-((u-(0.30-0.06*s))/0.09)**2); b2=np.exp(-((u-0.86)/0.10)**2)
        Lc=np.clip(0.04+0.95*b1*(0.55+0.7*nz2)+0.6*b2*(0.6+0.6*nz2)+0.35*band,0,1)
        Lc=np.where(u<0.06,0.03,Lc)
        L=np.clip(L*(1-chrome)+Lc*chrome,0,1)
        if seg>0:
            L=np.clip(L*(1-seg*0.65*(1-nz2))+seg*0.35*nz2*np.power(np.clip(L,0,1),0.6),0,1)
    hl=np.clip((L-0.45)/0.55,0,1)
    if iri>0 or skyref>0:
        H_,W_=L.shape
        fy=(yy/H_)[...,None]
        sky=np.array([0.80,0.90,1.0])*(1-fy)+np.array([1.0,0.86,0.92])*fy
        ph2=(xx*0.35-yy*0.9)/(W_*0.30)+u*0.12
        cols=np.array([[0.50,0.98,0.80],[0.52,0.84,1.0],[0.76,0.58,1.0],[1.0,0.82,0.50]],np.float32)  # mint, ice-cyan, lilac, champagne
        tph=np.mod(ph2,1.0)*len(cols); i0=np.floor(tph).astype(int)%len(cols); i1=(i0+1)%len(cols); fr=(tph-np.floor(tph))[...,None]
        pal=cols[i0]*(1-fr)+cols[i1]*fr
        pal=np.clip(0.55+(pal-0.55)*sat,0.05,1)
        pal=np.clip(np.stack([ndi.gaussian_filter(pal[...,k],5) for k in range(3)],-1),0,1)
        w_sky=skyref*(0.25+0.75*hl[...,None])
        syn=syn*(1-w_sky)+np.clip(syn*sky*1.08,0,1)*w_sky
        w_i=np.clip(iri*np.power(hl,irip),0,0.92)[...,None]
        lm=(pal*np.array([0.299,0.587,0.114])).sum(-1,keepdims=True); paln=pal/np.maximum(lm,1e-3)
        syn=np.clip(syn*(1-w_i)+np.clip(L[...,None]*1.12*paln,0,1)*w_i,0,1)
    # original tone, remapped to the same range
    lo_,hi_=(edge,hi)
    l2=lo_+(hi_-lo_)*np.power(np.clip(lum,0,1),base_gamma)
    orig=np.clip(rgb*(l2/np.maximum(lum,1e-3))[...,None],0,1)
    w=(1-smooth(H,0.55*Hs,1.0*Hs))*syn_mix
    w=np.where(M&(a>0.98),w,1.0)*np.where(M2,1,0)
    w=np.where(M,w,1.0)
    col=w[...,None]*syn+(1-w[...,None])*orig
    rgbf=col.copy(); alpha=newa.copy()
    if spk>0 or glist>0:
        Hh,Ww=alpha.shape
        bnd=band if 'band' in dir() else np.zeros_like(L)
        score=np.where(M2,L*(0.55+0.45*np.clip(bnd,0,1)),0)*np.where(D2>1.5,1,0)
        score=ndi.gaussian_filter(score,1.6)
        mx=ndi.maximum_filter(score,size=int(34*up/2))
        cand=np.argwhere((score==mx)&(score>0.42))
        rng3=np.random.RandomState(gseed)
        # candidates weighted toward where light genuinely pools (score^3) — a few strong, many faint
        cs=np.array([score[p[0],p[1]] for p in cand]); order=np.argsort(-cs); cand=cand[order]; cs=cs[order]
        chosen=[]
        for p,sc in zip(cand,cs):
            if rng3.rand()>min(1.0,(sc/cs[0])**2.2*1.15): continue
            md=(44 if len(chosen)<4 else 26)*up/2
            if all((p[0]-q[0][0])**2+(p[1]-q[0][1])**2>md**2 for q in chosen): chosen.append((p,sc))
            if len(chosen)>=glist: break
        gy_,gx_=np.gradient(ndi.gaussian_filter(D2,2.0))
        for rank,(p,sc) in enumerate(chosen):
            py,px=float(p[0]),float(p[1])
            # position: drifts off the exact peak; ~40% slip toward/over the stroke edge
            ang=rng3.rand()*2*np.pi; r_=rng3.rand()*7*up/2
            py+=np.sin(ang)*r_; px+=np.cos(ang)*r_
            if rng3.rand()<0.4:
                nyv,nxv=-gy_[int(p[0]),int(p[1])],-gx_[int(p[0]),int(p[1])]; nn=np.hypot(nyv,nxv)+1e-6
                d_=rng3.uniform(3,11)*up/2; py+=nyv/nn*d_; px+=nxv/nn*d_
            inten=np.clip((sc/cs[0])**1.4*rng3.uniform(0.7,1.0),0,1)
            strong=rank<3; medium=3<=rank<8
            armL=arm*up*(1.0 if strong else 0.5 if medium else 0.0)*rng3.uniform(0.75,1.15)
            y0,y1=max(0,int(py-armL-14*up)),min(Hh,int(py+armL+14*up)); x0,x1=max(0,int(px-armL-14*up)),min(Ww,int(px+armL+14*up))
            if y1<=y0 or x1<=x0: continue
            Y,X=np.mgrid[y0:y1,x0:x1].astype(np.float32); dy,dx=Y-py,X-px
            g=0.85*np.exp(-((dx**2+dy**2)/(2*(1.7*up*(1.5 if strong else 1.0))**2)))*inten
            g+=0.22*np.exp(-((dx**2+dy**2)/(2*(6.5*up)**2)))*inten*(1.0 if (strong or medium) else 0.5)
            if armL>0:
                rot=rng3.uniform(-0.45,0.45)
                dirs=[rot,rot+np.pi/2]+([rot+np.pi/4,rot-np.pi/4] if strong else [])
                for k,th in enumerate(dirs):
                    d=np.array([np.cos(th),np.sin(th)]); l_=armL*(0.35 if k>=2 else 1.0)*rng3.uniform(0.55,1.0)
                    for sgn in (1,-1):
                        l2_=l_*rng3.uniform(0.6,1.0)
                        t=(dx*d[0]+dy*d[1])*sgn; perp=np.abs(-dx*d[1]+dy*d[0])
                        arm_=np.exp(-((perp/(0.8*up))**2))*np.clip(1-t/l2_,0,1)**1.8*(t>0)
                        g+=0.8*arm_*inten
            g=np.clip(g,0,1)
            pc=pal[int(min(max(py,0),Hh-1)),int(min(max(px,0),Ww-1))]; pc=pc/np.max(pc)
            tint_=(np.array([1.0,0.99,0.97])*(1-spk_tint)+pc*spk_tint)
            rgbf[y0:y1,x0:x1]=np.clip(rgbf[y0:y1,x0:x1]*(1-g[...,None])+tint_*g[...,None],0,1)
            alpha[y0:y1,x0:x1]=np.maximum(alpha[y0:y1,x0:x1],g)
    out=Image.fromarray((np.dstack([rgbf,alpha])*255).astype(np.uint8))
    if not crop: return out
    b=out.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox()
    return out.crop((b[0]-4*up,b[1]-4*up,b[2]+4*up,b[3]+4*up))
if __name__=='__main__':
    base=dict(Hs=22,p=0.5,RS=0.12,amp=1.0,bandpow=12,bands=2.5,nmod=0.45,rim=0.7,cool=0.5,edge_o=0.03,mid_l=0.22,hi_o=1.0,sheen=0.85)
    R=dict(base,chrome=0.85,seg=0.75,iri=1.2,irip=0.75,skyref=0.65,sat=1.35,spk=0,arm=24,spk_tint=0.55)
    R3=dict(R,arm=36,glist=24,gseed=3)
    R4=dict(R,arm=36,glist=24,gseed=12)
    for name,kw in {'R3':R3,'R4':R4}.items():
        for th in ('light',):
            build(theme=th,**kw).save(S+f'lab/m2_{name}_{th}.png')
    print('ok')
