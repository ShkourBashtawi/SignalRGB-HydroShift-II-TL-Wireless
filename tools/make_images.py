#!/usr/bin/env python3
"""Draws the two device images (original artwork, 1024x1024, transparent).

  assets/hydroshift_ii_tl_wireless.png  - 360 radiator with 3 TL fans (edge + corner lights), square LCD pump head
  assets/lwireless_rx.png               - the L-Wireless USB receiver
"""
import colorsys, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = 2048  # draw at 2x, downscale for anti-aliasing
OUT = Path(__file__).resolve().parent.parent / "assets"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def rainbow(t, s=0.85, v=1.0):
    r, g, b = colorsys.hsv_to_rgb(t % 1.0, s, v)
    return int(r * 255), int(g * 255), int(b * 255)


def glow_layer(size, draw_fn, blur):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def receiver():
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 1024, 1024
    # rotate the dongle by drawing on its own layer
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    g = ImageDraw.Draw(layer)
    bw, bh = 520, 1000
    bx0, by0 = cx - bw / 2, cy - bh / 2 + 160
    # USB-A plug
    g.rectangle([cx - 190, by0 - 380, cx + 190, by0 + 20], fill=(196, 200, 208, 255), outline=(150, 154, 162, 255), width=8)
    g.rectangle([cx - 150, by0 - 340, cx + 150, by0 - 210], fill=(40, 42, 48, 255))
    for sx in (-70, 40):
        g.rectangle([cx + sx, by0 - 320, cx + sx + 30, by0 - 290], fill=(196, 200, 208, 255))
    # body
    g.rounded_rectangle([bx0, by0, bx0 + bw, by0 + bh], radius=120, fill=(24, 26, 31, 255), outline=(62, 66, 76, 255), width=10)
    g.rounded_rectangle([bx0 + 40, by0 + 40, bx0 + bw - 40, by0 + bh - 40], radius=90, outline=(40, 43, 50, 255), width=6)
    # signal glyph + LED strip
    sx, sy = cx, by0 + 560
    for k, r in enumerate((90, 160, 230)):
        g.arc([sx - r, sy - r, sx + r, sy + r], 225, 315, fill=(0, 170, 255, 255), width=26)
    g.ellipse([sx - 34, sy - 34, sx + 34, sy + 34], fill=(0, 170, 255, 255))
    glow = glow_layer((S, S), lambda q: q.rounded_rectangle([cx - 150, by0 + bh - 170, cx + 150, by0 + bh - 130], radius=20, fill=(0, 190, 255, 255)), 22)
    layer.alpha_composite(glow)
    g = ImageDraw.Draw(layer)
    g.rounded_rectangle([cx - 150, by0 + bh - 170, cx + 150, by0 + bh - 130], radius=20, fill=(120, 225, 255, 255))
    f = ImageFont.truetype(FONT, 64)
    g.text((cx, by0 + 260), "RX", font=f, fill=(170, 176, 190, 255), anchor="mm")
    layer = layer.rotate(-28, resample=Image.BICUBIC, center=(cx, cy))
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    shadow.putalpha(layer.getchannel("A").point(lambda a: a * 0.45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(30))
    img.alpha_composite(shadow, (24, 40))
    img.alpha_composite(layer)
    img.resize((1024, 1024), Image.LANCZOS).save(OUT / "lwireless_rx.png", optimize=True)


def hsv(t,s=0.75,v=1.0):
    r,g,b=colorsys.hsv_to_rgb(t%1,s,v); return (int(r*255),int(g*255),int(b*255))
def grad_line(d,p0,p1,t0,t1,w,steps=40):
    for i in range(steps):
        a=i/steps; b=(i+1)/steps
        d.line([(p0[0]+(p1[0]-p0[0])*a,p0[1]+(p1[1]-p0[1])*a),(p0[0]+(p1[0]-p0[0])*b,p0[1]+(p1[1]-p0[1])*b)],fill=hsv(t0+(t1-t0)*a)+(255,),width=w)
def fan_lights(cx,cy,h,phase):
    # TL frame light: top and bottom edges plus the four corner chamfers (octagon, sides dark)
    c=h*0.30; inset=h*0.04
    L,T,R,B=cx-h+inset,cy-h+inset,cx+h-inset,cy+h-inset
    return [((L,T+c),(L+c,T),phase,phase+0.12),((L+c,T),(R-c,T),phase+0.12,phase+0.30),((R-c,T),(R,T+c),phase+0.30,phase+0.42),
            ((L,B-c),(L+c,B),phase+0.55,phase+0.67),((L+c,B),(R-c,B),phase+0.67,phase+0.85),((R-c,B),(R,B-c),phase+0.85,phase+0.97)]
def tl_fan(img,cx,cy,sz,phase):
    d=ImageDraw.Draw(img); h=sz/2
    d.rectangle([cx-h,cy-h,cx+h,cy+h],fill=(16,17,20,255))
    segs=fan_lights(cx,cy,h,phase)
    img.alpha_composite(glow_layer(img.size,lambda g:[grad_line(g,a,b,t0,t1,int(sz*0.035)) for a,b,t0,t1 in segs],sz*0.025))
    d=ImageDraw.Draw(img)
    for a,b,t0,t1 in segs: grad_line(d,a,b,t0,t1,int(sz*0.014))
    # big dark blade disc with faint blade seams
    r=h*0.92
    d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=(8,8,10,255),outline=(30,31,36,255),width=4)
    for k in range(9):
        a=2*math.pi*k/9
        pts=[(cx+(r*0.25+(r*0.95-r*0.25)*u)*math.cos(a+0.7*u),cy+(r*0.25+(r*0.95-r*0.25)*u)*math.sin(a+0.7*u)) for u in [i/12 for i in range(13)]]
        d.line(pts,fill=(26,27,32,255),width=5)
    hub=r*0.22
    d.ellipse([cx-hub,cy-hub,cx+hub,cy+hub],fill=(20,21,25,255),outline=(46,48,56,255),width=5)
    d.ellipse([cx-hub*0.45,cy-hub*0.45,cx+hub*0.45,cy+hub*0.45],fill=(12,12,15,255),outline=(60,62,70,255),width=4)
def hydroshift(out=None):
    """360 radiator, three TL fans (frame light on the top/bottom edges and corner chamfers), square LCD pump head."""
    img=Image.new("RGBA",(S,S),(0,0,0,0)); d=ImageDraw.Draw(img)
    fsz=560; W=3*fsz; x0=(S-W)/2-40; top=300
    # pump (bottom-left) and tubes up to the radiator's underside
    pw=440; px=x0+220; py=1470
    for off in (-34,34):
        p0=(px+pw/2-40+off*0.2,py-pw/2+40+off); p3=(x0+fsz*1.05+off*2.2,top+fsz-10)
        c1=(p0[0]+260,p0[1]-40); c2=(p3[0]-40,p3[1]+330)
        pts=[]
        for i in range(41):
            t=i/40
            x=(1-t)**3*p0[0]+3*(1-t)**2*t*c1[0]+3*(1-t)*t*t*c2[0]+t**3*p3[0]
            y=(1-t)**3*p0[1]+3*(1-t)**2*t*c1[1]+3*(1-t)*t*t*c2[1]+t**3*p3[1]
            pts.append((x,y))
        # dense discs give a smooth tube (thick PIL lines leave seams on curves)
        dense=[]
        for i in range(len(pts)-1):
            for k in range(8):
                u=k/8; dense.append((pts[i][0]+(pts[i+1][0]-pts[i][0])*u, pts[i][1]+(pts[i+1][1]-pts[i][1])*u))
        dense.append(pts[-1])
        for x,y in dense: d.ellipse([x-29,y-29,x+29,y+29],fill=(34,35,40,255))
        for x,y in dense: d.ellipse([x-23,y-23,x+23,y+23],fill=(12,12,15,255))
    # radiator: three joined frames + end tank on the right
    d.rounded_rectangle([x0+W-10,top+30,x0+W+90,top+fsz-30],radius=16,fill=(20,21,25,255),outline=(44,46,54,255),width=4)
    d.rectangle([x0-8,top-8,x0+W+8,top+fsz+8],fill=(10,10,12,255))
    for i in range(3): tl_fan(img,x0+fsz/2+i*fsz,top+fsz/2,fsz,i*0.33)
    d=ImageDraw.Draw(img)
    # pump head: square, RGB light frame around the LCD
    bx0,by0,bx1,by1=px-pw/2,py-pw/2,px+pw/2,py+pw/2
    d.rounded_rectangle([bx0,by0,bx1,by1],radius=30,fill=(18,19,23,255),outline=(60,62,70,255),width=5)
    fr=26
    frame=[((bx0+fr,by0+fr),(bx1-fr,by0+fr),0.55,0.75),((bx1-fr,by0+fr),(bx1-fr,by1-fr),0.75,0.95),((bx1-fr,by1-fr),(bx0+fr,by1-fr),0.95,1.15),((bx0+fr,by1-fr),(bx0+fr,by0+fr),1.15,1.35)]
    img.alpha_composite(glow_layer(img.size,lambda g:[grad_line(g,a,b,t0,t1,22) for a,b,t0,t1 in frame],18))
    d=ImageDraw.Draw(img)
    for a,b,t0,t1 in frame: grad_line(d,a,b,t0,t1,10)
    m=44; lx0,ly0,lx1,ly1=bx0+m,by0+m,bx1-m,by1-m
    d.rectangle([lx0,ly0,lx1,ly1],fill=(6,7,12,255))
    # subtle starfield backdrop
    rnd=random.Random(3)
    for _ in range(140):
        x=rnd.uniform(lx0,lx1); y=rnd.uniform(ly0,ly1); a=rnd.randint(40,160)
        d.point((x,y),fill=(200,180,255,a))
    big=ImageFont.truetype(FONT,150); unit=ImageFont.truetype(FONT,46); sm=ImageFont.truetype(FONT_R,26)
    cx=(lx0+lx1)/2; cy=(ly0+ly1)/2
    d.text((cx,ly0+48),"WATER",font=sm,fill=(170,170,190,255),anchor="mm")
    d.text((cx-34,cy+4),"24",font=big,fill=(255,255,255,255),anchor="mm")
    d.text((cx+108,cy+22),"°C",font=unit,fill=(255,255,255,255),anchor="mm")
    d.text((cx,ly1-44),"PUMP 2245 RPM",font=sm,fill=(170,170,190,255),anchor="mm")
    img.resize((1024,1024),Image.LANCZOS).save(out or OUT / "hydroshift_ii_tl_wireless.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    hydroshift()
    receiver()
    print("wrote", *sorted(p.name for p in OUT.glob("*.png")))
