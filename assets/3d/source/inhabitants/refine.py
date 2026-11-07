"""R5E original surface refinements. Loaded by build.py; no external assets."""
def smooth_outline(points, samples=6):
 result=[];count=len(points)
 for j in range(count):
  a,b,c,d=[Vector(points[k%count]) for k in [j-1,j,j+1,j+2]]
  for step in range(samples):
   t=step/samples
   result.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
 return result

def open_folio(w,cloth,ivory,metal,glow):
 # A real open codex: curved page fans, boards, spine and original linework.
 x=w+.105;y=-.16;z=.80
 for sign in [-1,1]:
  board=[(x,y,z-.15),(x+sign*.145,y-.055,z-.14),(x+sign*.145,y-.055,z+.14),(x,y,z+.15)]
  plate('Restoration folio board',board,cloth,'HandR')
  line('Folio gilded border',board+[board[0]],.005,metal,'HandR')
  for leaf in range(4):
   offset=.006*(leaf+1);vs=[]
   for row in range(2):
    for i in range(13):
     t=i/12;vs.append((x+sign*.14*t,y-.065*t-offset-.012*math.sin(math.pi*t),z-.135+row*.27))
   mesh('Curved parchment leaves',vs,[(i,i+1,14+i,13+i) for i in range(12)],ivory,'HandR')
  for row in range(8):
   zz=z-.10+row*.026
   line('Handwritten conservation lines',[(x+sign*.025,y-.03,zz),(x+sign*.065,y-.05,zz+.002),(x+sign*.115,y-.073,zz)],.0018,metal,'HandR')
 line('Restoration folio spine',[(x,y-.025,z-.16),(x,y-.025,z+.16)],.011,metal,'HandR')
 jewel((x,y-.05,z),.022,glow,'HandR')

def refine_character(who,w,headz,skin,hair,cloth,silk,metal,ivory,ink,glow):
 broad=who=='samael';elf=who=='aryn';fairy=who=='ytha'
 # Reduce the toy-like spherical cheeks; keep them integrated with the face.
 for o in list(bpy.context.scene.objects):
  if o.type=='MESH' and o.name.startswith('Sculpted cheek'):
   center=sum((v.co for v in o.data.vertices),Vector())/len(o.data.vertices)
   for v in o.data.vertices:v.co=center+(v.co-center)*(.38 if broad else .48)
 if broad:
  # Sculpted mandible, swept temple ridges and layered cuirass, not a color swap.
  for s,side in [(-1,'L'),(1,'R')]:
   strand('Angular infernal mandible',[(s*.13,-.055,headz+.075),(s*.108,-.105,headz+.015),(s*.046,-.10,headz-.025)],[.026,.029,.009],skin,'Head',12)
   strand('Obsidian brow crest',[(s*.017,-.12,headz+.20),(s*.07,-.125,headz+.218),(s*.14,-.06,headz+.21)],[.012,.022,.007],ink,'Head',12)
   strand('Temple blade',[(s*.13,.015,headz+.20),(s*.20,.025,headz+.30),(s*.23,.01,headz+.34)],[.032,.022,.001],skin,'Head')
   for j in range(3):
    pts=[(s*(w-.07),-.085,1.30-j*.035),(s*(w+.11),-.075,1.30-j*.025),(s*(w+.13),.045,1.23-j*.03),(s*(w-.06),.07,1.24-j*.025)]
    plate('Overlapping forged shoulder',pts,ink if j%2 else metal,'Shoulder'+side)
   line('Leather harness',[(s*.13,-.19,.96),(s*.21,-.195,1.08),(s*.29,-.16,1.24)],.022,ink)
   for j in range(4):jewel((s*(.16+.03*j),-.213,1.00+.052*j),.012,metal)
   strand('Forearm tendon',[(s*(w+.12),-.13,.88),(s*(w+.10),-.11,.97)],[.018,.025],skin,'Elbow'+side)
  plate('Infernal sternum crest',[(-.10,-.19,1.24),(0,-.225,1.30),(.10,-.19,1.24),(.065,-.20,1.16),(0,-.217,1.10),(-.065,-.20,1.16)],ink)
  line('Violet chest fissure',[(-.04,-.227,1.24),(0,-.237,1.21),(-.02,-.227,1.18),(.02,-.223,1.145)],.004,glow)
 elif elf:
  for s in [-1,1]:
   for j in range(4):
    z=1.09+j*.043
    line('Fern embroidery',[(s*.09,-.185,z),(s*.15,-.174,z+.022),(s*.10,-.185,z+.034)],.003,metal)
   line('Elven temple filigree',[(s*.095,-.13,headz+.16),(s*.12,-.105,headz+.18),(s*.13,-.04,headz+.17)],.003,metal,'Head')
   strand('Silken shoulder stole',[(s*.11,-.10,1.30),(s*.21,-.10,1.23),(s*.20,-.11,1.12)],[.025,.045,.02],ivory)
  jewel((0,-.19,1.25),.028,glow)
 elif fairy:
  # Replace the angular wing fans by smoothly scalloped butterfly surfaces.
  for o in list(bpy.context.scene.objects):
   if o.type=='MESH' and o.name.startswith(('Lobed butterfly','Scalloped wing','Branching nervure','Wing ocellus')):bpy.data.objects.remove(o,do_unlink=True)
  membrane=bpy.data.materials['Opaline membrane'];rose=bpy.data.materials['Rose membrane']
  membrane.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.42
  for s,side in [(-1,'L'),(1,'R')]:
   root=(s*.075,.13,1.15)
   outline=[root,(s*.24,.17,1.49),(s*.53,.18,1.67),(s*.73,.18,1.60),(s*.76,.18,1.41),(s*.57,.17,1.20),(s*.38,.16,1.08),(s*.64,.17,.91),(s*.54,.17,.65),(s*.32,.16,.72),(s*.16,.14,.90)]
   rim=smooth_outline(outline)
   plate('Scalloped opaline butterfly wing',rim,membrane,'Wing'+side)
   line('Pearlescent wing lace',rim+[rim[0]],.005,glow,'Wing'+side)
   for tip in [outline[i] for i in [2,3,4,6,7,8,9]]:
    mid=Vector(root).lerp(Vector(tip),.57)
    line('Curved branching wing vein',[root,mid+Vector((s*.025,-.006,.03)),tip],.004,glow,'Wing'+side)
   for xx,zz,rx,rz in [(.53,1.46,.10,.14),(.48,.85,.08,.12)]:
    pts=[(s*(xx+rx*math.cos(TAU*i/32)),.158,zz+rz*math.sin(TAU*i/32)) for i in range(33)]
    plate('Rose butterfly eyespot',pts,rose,'Wing'+side);line('Eyespot lace',pts,.003,ivory,'Wing'+side)
    jewel((s*xx,.14,zz),.033,glow,'Wing'+side)
   for j in range(5):
    strand('Cascading rose curl',[(s*(.08+j*.012),.03,headz+.28),(s*(.16+j*.008),.02,headz+.12),(s*(.17+j*.008),.04,headz-.04),(s*.12,.045,headz-.10)],[.019,.028,.024,.001],hair,'Head',12)
   for j in range(5):
    a=j*TAU/5;ell('Living flower tiara',(s*.10+.028*math.cos(a),-.04,headz+.30+.028*math.sin(a)),(.022,.013,.018),silk,'Head')
  for j in range(9):
   a=j*TAU/9
   strand('Bellflower outer petal',[(.11*math.cos(a),.075*math.sin(a),.94),(.23*math.cos(a),.15*math.sin(a),.76),(.25*math.cos(a),.16*math.sin(a),.59)],[.022,.055,.001],silk,'Pelvis',12)
 else:
  # Curl sweep, layered cape scallops, lunar fastenings and a grimoire reliquary.
  for j in range(6):
   a=j*TAU/6;pts=[(-.14+.07*math.cos(a),.06+.055*math.sin(a),headz+.21),(-.16+.065*math.cos(a+.6),.06+.055*math.sin(a+.6),headz+.12),(-.14+.035*math.cos(a+1.2),.055,headz+.045)]
   strand('Loose moon curls',pts,[.018,.023,.002],hair,'Head',12)
  for s in [-1,1]:
   for j in range(5):
    strand('Layered lunar cape panel',[(s*(.04+j*.035),.15,1.23),(s*(.07+j*.037),.23,.93),(s*(.05+j*.038),.24,.60+j*.02)],[.028,.04,.002],silk if j%2 else cloth)
   jewel((s*.13,-.14,1.25),.03,metal)
  x=w+.11
  for j in range(4):
   a=j*TAU/4;line('Grimoire corner inlay',[(x+.085*math.cos(a),-.20,.80+.13*math.sin(a)),(x+.06*math.cos(a+.3),-.21,.80+.10*math.sin(a+.3))],.007,metal,'HandR')
  jewel((x,-.225,.80),.043,glow,'HandR')
 # Separate FX materials: runtime controls their presence, not bone transforms.
 fx=mat('FX signature',{'samael':(.40,.08,.8),'aryn':(.95,.64,.22),'ytha':(.47,.95,.66),'lua':(.36,.53,1)}[who],.05,.35,.7,1.8)
 if broad:
  shadow=mat('FX shadow',(.025,.006,.05),rough=.95,alpha=.28)
  for s in [-1,1]:
   for j in range(3):
    pts=[(s*(.32+j*.035),.14,.34),(s*(.44+j*.025),.17,.62),(s*(.39+j*.025),.19,.98),(s*.33,.16,1.35)]
    strand('Coiled shadow vapor',pts,[.003,.036,.023,.001],shadow,'Magic',10)
    line('Violet tension filament',pts,.004,fx,'Magic')
  for j in range(14):
   a=j*TAU/14;jewel((.44*math.cos(a),.20*math.sin(a),.35+(j%4)*.14),.011,fx,'Magic')
 elif elf:
  for j in range(3):
   pts=[(w+.10+.15*math.cos(TAU*i/48),-.25-.03*j,.81+.19*math.sin(TAU*i/48)) for i in range(49)]
   line('Golden conservation orbit',pts,.0025,fx,'HandR')
  for j in range(9):
   z=.67+j*.032
   line('Luminous book suture',[(w+.07,-.255,z),(w+.10,-.267,z+.012),(w+.13,-.255,z)],.0025,fx,'HandR')
 elif fairy:
  for j in range(18):
   a=j*TAU/18;r=.31+.06*math.sin(j*2)
   ell('Luminous pollen',(r*math.cos(a),r*.5*math.sin(a),.45+(j%6)*.14),(.009,.009,.016),fx,'Magic')
  for j in range(8):
   a=j*TAU/8;ell('Drifting luminous petal',(.33*math.cos(a),.18*math.sin(a),.58+.12*math.sin(a*2)),(.015,.009,.032),fx,'Magic')
 else:
  for j in range(3):
   r=.27+j*.06
   for segment in range(3):
    pts=[(r*math.cos(i*.07+segment*TAU/3),-.23+.07*math.sin(i*.07+j),.86+r*.55*math.sin(i*.07+segment*TAU/3)) for i in range(25)]
    line('Broken experimental orbit',pts,.0035,fx,'Magic')
  for j in range(9):
   a=j*TAU/9;x=.40*math.cos(a);z=.86+.27*math.sin(a)
   line('Experimental glyph',[(x-.012,-.24,z-.02),(x+.012,-.24,z),(x-.012,-.24,z+.02)],.003,fx,'Magic')
   jewel((x,-.24,z),.013,fx,'Magic')
