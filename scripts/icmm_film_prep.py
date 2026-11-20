from PIL import Image, ImageEnhance
import numpy as np, os
U='/mnt/user-data/uploads/my-video/'
M=U+'photo/I close my mind/MV素材/'
P=U+'public/i-close-my-mind/'
SRC={'B':P+'B_shokushitsu.jpg','N6c':M+'N6cv2_曲がり角_過去.png','P2':M+'P2_線路沿い.png','A':P+'A_classroom.jpg',
'S1':M+'S1_校門.png','P1':M+'P1_寝起き.png','N1':M+'N1_BBQ.png','K1':M+'K1_カラオケ真顔.png','K2':M+'K2_カラオケ吹き出し.png',
'K3':M+'K3_カラオケ手ブレ.png','N2':M+'N2_自販機.png','P5':M+'P5_屋上.png','C':P+'C_hanabi.jpg','P3':M+'P3_夜の公園.png',
'H1':M+'film/H1_図書館.png','H4':M+'film/H4_中庭で弁当.png','H5':M+'film/H5_文化祭の準備_v2.png','H11':M+'film/H11_写真シール_v2.png',
'H13':M+'film/H13_修学旅行_v2.png','I1':M+'film/I1_フェリー_v2.png','I2':M+'film/I2_島の路地.png','U2':M+'film/U2_学食.png',
'D1':M+'film/D1_デジタルアート.png','D3':M+'film/D3_水族館.png','P4':M+'P4_改札.png','SB1':M+'film/SB1_雪まみれ.png','SB2':M+'film/SB2_リフト.png','SB3':M+'film/SB3_すべってる.png','SB4':M+'film/SB4_ロッジ.png','BUS1':M+'film/BUS1_昼のバス.png','BUS2':M+'film/BUS2_終バス.png','V2P':M+'film/V2P_夜の公園_大学.png','N6v2':M+'N6v2_曲がり角.png','N8v2':M+'N8v2_曲がり角_今.png','D':P+'D_hodokyo.jpg'}
ZOOM={'H5':1.1}

F=M+'film/'
for k,n in {'H2':'H2_落書き','H3':'H3_突っ伏し','H6':'H6_体育祭','H7':'H7_雨宿り','H8':'H8_アイス半分こ','H9':'H9_土手',
 'H10':'H10_ゲーセン','H12':'H12_駄菓子屋','H14':'H14_冬の帰り道','U1':'U1_芝生','U3':'U3_講義室','U4':'U4_夜道','U5':'U5_肉まん',
 'U6':'U6_ワンルーム','U7':'U7_ファミレス','U8':'U8_学園祭','U9':'U9_卒業の日','I3':'I3_海辺のアート','I4':'I4_港ごはん','I5':'I5_堤防の夕日',
 'D2M':'D2_美術館','D4':'D4_観覧車','D5':'D5_イルミネーション','DE':'D2_歩道橋_誰もいない'}.items():
    SRC[k]=F+n+'.png'
SRC['PC1']=F+'PC1_屋上で笑い転げる.png'; SRC['PC2']=F+'PC2_二人の足.png'; SRC['W1']=M+'W1v2_二人の影.png'; SRC['S2']=M+'S2_歩道の曲がり方.png'; SRC['CV1']=M+'CV1v2_コンビニの駐車場.png'
ONLY=set(os.environ.get('ONLY','').split(',')) - {''}
if ONLY: SRC={k:v for k,v in SRC.items() if k in ONLY}
import sys
OFF={}  # horizontal center 0..1
if os.path.exists('off.txt'):
    for l in open('off.txt'):
        k,v=l.split(); OFF[k]=float(v)
os.makedirs('crop',exist_ok=True)
def grade(im):
    a=np.asarray(im).astype(np.float32)/255
    g=a.mean(2,keepdims=True); a=g+(a-g)*0.82
    a=0.06+a*0.9
    a[...,0]*=1.03; a[...,2]*=0.94
    return Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8))
for k,f in SRC.items():
    im=Image.open(f).convert('RGB').resize((1456,816),Image.LANCZOS)
    z=ZOOM.get(k,1)
    if z!=1:
        w,h=1456/z,816/z; im=im.crop(((1456-w)/2,(816-h)/2,(1456+w)/2,(816+h)/2)).resize((1456,816),Image.LANCZOS)
    cx=OFF.get(k,0.5)*1456; x0=int(min(max(cx-544,0),1456-1088))
    grade(im.crop((x0,0,x0+1088,816))).save(f'crop/{k}.png')
    grade(im).save(f'crop/{k}_full.png')
# contact
ks=list(SRC); W=4
sheet=Image.new('RGB',(W*360,((len(ks)+W-1)//W)*290),'black')
from PIL import ImageDraw; d=ImageDraw.Draw(sheet)
for i,k in enumerate(ks):
    t=Image.open(f'crop/{k}.png').resize((360,270)); sheet.paste(t,((i%W)*360,(i//W)*290)); d.text(((i%W)*360+5,(i//W)*290+272),k,fill='white')
sheet.save('contact.jpg')
