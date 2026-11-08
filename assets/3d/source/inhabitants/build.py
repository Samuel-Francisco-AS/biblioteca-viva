"""R5 original sculpted surface recipe. Blender 3.3; meters, -Y front, Z up.
All shapes are authored here; no third-party asset or texture. Run from repo root.
"""
import bpy, math, os
from mathutils import Vector, Matrix
ROOT=os.getcwd(); OUT=ROOT+'/assets/3d/source/inhabitants'; DEST=ROOT+'/src/features/library/three/assets'
TAU=math.tau
exec(compile(open(OUT+'/refine.py').read(), OUT+'/refine.py', 'exec'))
exec(compile(open(OUT+'/physical.py').read(), OUT+'/physical.py', 'exec'))

def mat(name,c,metal=0,rough=.55,alpha=1,glow=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,alpha);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,alpha);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;p.inputs['Alpha'].default_value=alpha;p.inputs['Emission'].default_value=(*c,1);p.inputs['Emission Strength'].default_value=glow
 if alpha<1:m.blend_method='BLEND';m.use_screen_refraction=False
 m.use_backface_culling=False
 return m

def mesh(name,vs,fs,m,bone='Torso',weights=None):
 d=bpy.data.meshes.new(name);d.from_pydata(vs,[],fs);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);d.materials.append(m)
 for p in d.polygons:p.use_smooth=True
 if weights is None:weights=[{bone:1} for _ in vs]
 for i,w in enumerate(weights):
  for key,value in w.items():
   g=o.vertex_groups.get(key) or o.vertex_groups.new(name=key);g.add([i],value,'REPLACE')
 return o

def ell(name,p,s,m,bone='Torso'):
 vs=[];fs=[];n=24;r=14
 for j in range(r+1):
  a=math.pi*j/r
  for i in range(n):
   t=TAU*i/n;vs.append((p[0]+s[0]*math.sin(a)*math.cos(t),p[1]+s[1]*math.sin(a)*math.sin(t),p[2]+s[2]*math.cos(a)))
 for j in range(r):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;fs.append((a,b,b+n,a+n))
 return mesh(name,vs,fs,m,bone)

def loft(name,rings,m,bone='Torso',blend=None,n=32):
 vs=[];fs=[];weights=[]
 for z,rx,ry,cx,cy in rings:
  for i in range(n):
   a=TAU*i/n;vs.append((cx+rx*math.cos(a),cy+ry*math.sin(a),z))
   if blend:
    k,z0,z1=blend;t=max(0,min(1,(z-z0)/(z1-z0)));weights.append({bone:1-t,k:t})
   else:weights.append({bone:1})
 for j in range(len(rings)-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;fs.append((a,b,b+n,a+n))
 fs.extend([tuple(reversed(range(n))),tuple((len(rings)-1)*n+i for i in range(n))])
 return mesh(name,vs,fs,m,bone,weights)

def strand(name,pts,radii,m,bone='Head',sides=10):
 vs=[];fs=[]
 for j,p in enumerate(pts):
  tangent=Vector(pts[min(j+1,len(pts)-1)])-Vector(pts[max(0,j-1)])
  tangent.normalize();u=tangent.cross(Vector((0,1,0)))
  if u.length<.01:u=tangent.cross(Vector((1,0,0)))
  u.normalize();v=tangent.cross(u)
  for i in range(sides):vs.append(Vector(p)+radii[j]*(math.cos(TAU*i/sides)*u+math.sin(TAU*i/sides)*v))
 for j in range(len(pts)-1):
  for i in range(sides):a=j*sides+i;b=j*sides+(i+1)%sides;fs.append((a,b,b+sides,a+sides))
 fs.extend([tuple(reversed(range(sides))),tuple((len(pts)-1)*sides+i for i in range(sides))]);return mesh(name,vs,fs,m,bone)

def line(name,pts,r,m,bone='Torso'):return strand(name,pts,[r]*len(pts),m,bone,8)
def plate(name,pts,m,bone='Torso'):return mesh(name,pts,[tuple(range(len(pts)))],m,bone)
def jewel(p,s,m,bone='Torso'):
 x,y,z=p;return mesh('Cut crystal',[(x,y,z+s),(x,y,z-s)]+[(x+s*.55*math.cos(i*TAU/6),y+s*.35*math.sin(i*TAU/6),z) for i in range(6)],[(0,2+i,2+(i+1)%6) for i in range(6)]+[(1,2+(i+1)%6,2+i) for i in range(6)],m,bone)
def book(p,m,paper,metal,bone):
 x,y,z=p
 for dy,rx,rz,ma in [(-.055,.112,.16,m),(.055,.112,.16,m),(0,.101,.15,paper)]:
  loft('Bound codex',[(z-rz,rx,.014 if dy else .045,x,y+dy),(z+rz,rx,.014 if dy else .045,x,y+dy)],ma,bone,n=4)
 for zz in [z-.11,z+.11]:line('Book clasp',[(x-.085,y-.075,zz),(x+.085,y-.075,zz)],.008,metal,bone)
 jewel((x,y-.08,z),.037,metal,bone)

def build(who,height):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for m in list(bpy.data.materials):bpy.data.materials.remove(m)
 for action in list(bpy.data.actions):bpy.data.actions.remove(action)
 broad=who=='samael'; fairy=who=='ytha';elf=who=='aryn';mage=who=='lua'
 skin=mat('Obsidian skin' if broad else 'Warm porcelain',(.17,.105,.20) if broad else ((.80,.64,.53) if elf else (.84,.59,.57)),rough=.62)
 hair=mat('Carved hair',{'samael':(.024,.016,.038),'aryn':(.026,.035,.045),'ytha':(.49,.12,.32),'lua':(.075,.095,.23)}[who],rough=.4)
 cloth=mat('Woven velvet',{'samael':(.035,.02,.055),'aryn':(.025,.135,.105),'ytha':(.24,.075,.29),'lua':(.22,.025,.10)}[who],rough=.8)
 silk=mat('Silk lining',{'samael':(.14,.055,.16),'aryn':(.12,.29,.21),'ytha':(.56,.23,.39),'lua':(.12,.16,.31)}[who],rough=.45)
 metal=mat('Aged brass',(.55,.32,.115),.72,.34);ivory=mat('Ivory linen',(.84,.74,.53),rough=.85);ink=mat('Ink leather',(.018,.014,.025),rough=.47)
 glow=mat('Signature crystal',{'samael':(.48,.13,.92),'aryn':(.75,.59,.22),'ytha':(.44,.8,.57),'lua':(.28,.48,.95)}[who],.15,.28,glow=.8)
 lips=mat('Lip and ear blush',(.28,.11,.19) if broad else (.48,.19,.23),rough=.7)
 w=.33 if broad else (.172 if elf else (.18 if fairy else .20));headz=1.40 if broad else 1.39
 # Continuous ring surfaces with true multi-bone weights at waist, knees and elbows.
 loft('Anatomical tailored torso',[(.77,w*.85,.12,0,0),(.91,w*.85,.135,0,0),(1.03,w*.92,.145,0,0),(1.17,w*1.20,.17,0,0),(1.29,w*1.12,.135,0,0),(1.33,w*.65,.10,0,0)],cloth,'Pelvis',('Torso',.87,1.10))
 for s,side in [(-1,'L'),(1,'R')]:
  x=s*w*.56
  loft('Flexible trouser',[(.14,.065,.07,x,0),(.35,.065,.065,x,0),(.47,.076,.07,x,0),(.57,.082,.08,x,0),(.82,.09,.10,x,0)],ink,'Knee'+side,('Hip'+side,.40,.55))
  ell('Shaped boot',(x,-.045,.09),(.075 if not broad else .095,.14,.09),ink,'Knee'+side)
  line('Boot seam',[(x-.04,-.16,.11),(x,-.18,.15),(x+.04,-.16,.11)],.006,metal,'Knee'+side)
  sx=s*(w+.06);ex=s*(w+.115)
  loft('Articulated sleeve',[(.86,.055 if not broad else .08,.06,ex,-.06),(1.00,.065 if not broad else .10,.07,sx,-.02),(1.08,.068 if not broad else .105,.08,sx,0),(1.25,.085 if not broad else .13,.095,s*w,0)],cloth,'Elbow'+side,('Shoulder'+side,.98,1.10))
  loft('Engraved cuff',[(.85,.062 if not broad else .087,.068,ex,-.06),(.90,.065 if not broad else .09,.07,ex,-.06)],metal,'Elbow'+side)
  ell('Palm',(ex,-.065,.79),(.052 if not broad else .069,.038,.073),skin,'Hand'+side)
  for f in range(4):
   xx=ex+(f-1.5)*(.020 if broad else .014);end=.69+abs(f-1.5)*.012
   strand('Jointed finger',[(xx,-.073,.77),(xx,-.088,.73),(xx,-.095,end)],[.012 if broad else .009,.010 if broad else .007,.004],skin,'Hand'+side)
   if broad:strand('Obsidian claw',[(xx,-.095,end+.016),(xx,-.11,end-.015)],[.009,0.001],ink,'Hand'+side)
  strand('Opposed thumb',[(ex-s*.04,-.06,.82),(ex-s*.07,-.09,.77),(ex-s*.065,-.11,.75)],[.019,.014,.007],skin,'Hand'+side)
 # Tailored open coat, separate draped panels rather than solid lampshade skirt.
 for s in [-1,1]:
  for j in range(3 if not fairy else 5):
   a=(j/(2 if not fairy else 4))*1.6+.15;x=s*(.11+.065*j)
   if fairy:
    strand('Layered petal',[(s*.09,.02,.98),(s*(.17+j*.016),-.04+j*.025,.78),(s*(.22+j*.012),-.07+j*.025,.55+j*.035)],[.055,.095,.002],silk if j%2 else cloth,'Pelvis',12)
   else:
    pts=[(s*w*.65,-.13,.95),(s*(w+.015),-.02,.78),(s*(w+.035),.09,.43),(s*.10,.13,.48),(s*.075,-.10,.80)]
    if j==0:plate('Split coat front',pts,silk,'Pelvis');line('Gold hem',pts+[pts[0]],.007,metal,'Pelvis')
    elif j==1:plate('Coat back tail',[(s*.02,.145,.94),(s*w,.14,.94),(s*(w+.05),.22,.45),(s*.035,.25,.39)],cloth,'Pelvis')
  line('Raised lapel',[(s*w,-.12,1.30),(s*w*.57,-.185,1.14),(s*.05,-.148,.96)],.025,ivory if elf else silk)
  for k in range(8):
   z=.98+k*.036;line('Arcane embroidery',[(s*.09,-.166,z),(s*(.11+k*.008),-.178,z+.018),(s*.10,-.174,z+.026)],.0038,metal)
 loft('Waist belt',[(.89,w*.88,.146,0,0),(.935,w*.88,.147,0,0)],ink,'Pelvis');jewel((0,-.158,.92),.044,glow,'Pelvis')
 ell('Neck',(0,0,1.355),(.07,.067,.105),skin,'Head')
 # Jaw/chin/cheek/brow contour differs by species, not just skin palette.
 hw=.167 if broad else (.112 if elf else (.124 if fairy else .132))
 loft('Sculpted face',[(headz-.025,.055 if elf else .075,.060,0,-.01),(headz+.02,hw*.75,.087,0,-.018),(headz+.075,hw,.10,0,-.008),(headz+.14,hw*1.02,.108,0,0),(headz+.22,hw*.94,.095,0,.006),(headz+.275,hw*.60,.065,0,.015)],skin,'Head')
 ell('Hair cap',(0,.025,headz+.245),(hw*1.07,.111,.097),hair,'Head')
 for s in [-1,1]:
  ell('Sculpted cheek',(s*hw*.65,-.072,headz+.09),(.035,.031,.036),skin,'Head')
  ell('Almond eye socket',(s*.052,-.099,headz+.151),(.039,.019,.023),ink,'Head')
  ell('Almond eye',(s*.052,-.111,headz+.151),(.030,.010,.015),ivory,'Head')
  ell('Luminous iris',(s*.052,-.12,headz+.152),(.012,.006,.014),glow,'Head')
  ell('Pupil',(s*.052,-.125,headz+.152),(.004,.002,.010),ink,'Head')
  line('Eyelid',[(s*.023,-.117,headz+.153),(s*.052,-.123,headz+.169),(s*.084,-.107,headz+.157)],.004,ink,'Head')
  line('Expressive eyebrow',[(s*.022,-.105,headz+.192),(s*.055,-.11,headz+.201),(s*.089,-.095,headz+.19)],.008 if broad else .005,hair,'Head')
 strand('Nose bridge',[(0,-.098,headz+.18),(0,-.126,headz+.11),(0,-.139,headz+.095)],[.011,.014,.018],skin,'Head')
 line('Cupid lip',[(-.031,-.098,headz+.054),(-.011,-.111,headz+.059),(0,-.114,headz+.055),(.014,-.109,headz+.06),(.032,-.097,headz+.058)],.0045,lips,'Head')
 # Hair locks are tapered ribbons/volumes, swept and layered individually.
 for i in range(13):
  a=TAU*i/13;x=hw*math.cos(a);y=.025+.09*math.sin(a)
  length=.14 if broad else (.46 if elf else (.34 if fairy else .23+.08*(i%3)))
  strand('Sculpted hair lock',[(x*.50,y*.6,headz+.31),(x,y,headz+.26),(x*1.16,y+.025,headz+.12),(x*1.05,y+.04,headz+.26-length)],[.026,.042,.032,.001],hair,'Head',12)
  if not broad:line('Hair glint',[(x,y-.012,headz+.25),(x*1.14,y+.012,headz+.12),(x*1.05,y+.025,headz+.27-length)],.0025,silk,'Head')
 for s in [-1,1]:
  if elf or fairy:
   pts=[(s*.10,.015,headz+.08),(s*(.245 if elf else .18),.015,headz+.25),(s*.14,-.035,headz+.15),(s*.115,-.03,headz+.07)]
   plate('Leaf ear cartilage',pts,skin,'Head');plate('Inner ear',[(s*.125,-.006,headz+.10),(s*(.218 if elf else .16),.003,headz+.219),(s*.145,-.034,headz+.145)],lips,'Head')
  if elf or mage:
   pts=[(s*.055+.043*math.cos(TAU*i/32),-.141,headz+.15+.031*math.sin(TAU*i/32)) for i in range(33)]
   line('Handmade spectacles',pts,.0045,metal,'Head');line('Temple arm',[(s*.094,-.137,headz+.16),(s*.12,.0,headz+.17)],.004,metal,'Head')
 if elf or mage:line('Glasses bridge',[(-.013,-.143,headz+.155),(0,-.148,headz+.164),(.013,-.143,headz+.155)],.004,metal,'Head')
 if broad:
  for s in [-1,1]:
   horn=[(s*.10,.02,headz+.26),(s*.18,.035,headz+.34),(s*.23,.06,headz+.47),(s*.20,.02,headz+.56),(s*.15,-.02,headz+.59)]
   strand('Swept infernal horn',horn,[.056,.048,.034,.018,.001],ink,'Head',16)
   for j in range(1,5):
    p=Vector(horn[1]).lerp(Vector(horn[2]),j/5);ell('Horn growth ridge',p,(.035,.042,.014),metal,'Head')
   ell('Infernal shoulder plate',(s*w,-.005,1.26),(.14,.115,.075),ink,'Shoulder'+('L' if s<0 else 'R'))
   for j in range(3):strand('Shoulder thorn',[(s*(w-.06+j*.05),.005,1.29),(s*(w-.04+j*.06),.01,1.39+j*.015)],[.022,.001],metal,'Shoulder'+('L' if s<0 else 'R'))
   line('Cheek rune',[(s*.104,-.079,headz+.09),(s*.091,-.101,headz+.06),(s*.107,-.08,headz+.025)],.005,glow,'Head')
  # Coffee and a real hinged-looking laptop silhouette, owned by left/right forearms.
  loft('Coffee ceramic',[(.79,.042,.042,-w-.12,-.12),(.89,.057,.057,-w-.12,-.12)],ivory,'HandL')
  line('Coffee handle',[( -w-.16,-.12,.87),(-w-.21,-.12,.87),(-w-.21,-.12,.81),(-w-.16,-.12,.81)],.012,metal,'HandL')
  book((w+.10,-.10,.72),ink,ink,glow,'HandR')
 elif elf:
  for s in [-1,1]:
   for j in range(15):
    z=headz+.17-j*.027;x=s*(.12+.015*math.sin(j*2.2));ell('Interwoven braid',(x,.10,z),(.025,.027,.027),hair,'Head')
   jewel((s*.13,-.02,headz+.055),.021,glow,'Head')
  plate('Restorer apron',[(-.115,-.15,.90),(.115,-.15,.90),(.14,-.17,.54),(-.14,-.17,.54)],ivory,'Pelvis')
  for x in [-.065,0,.065]:line('Restoration instrument',[(x,-.183,.68),(x,-.185,.83)],.007,metal,'Pelvis')
  open_folio(w,cloth,ivory,metal,glow)
 elif fairy:
  wing=mat('Opaline membrane',(.34,.62,.53),.1,.35,.66,.16)
  pink=mat('Rose membrane',(.62,.23,.45),.1,.35,.72,.10)
  for s,side in [(-1,'L'),(1,'R')]:
   root=(s*.075,.13,1.15)
   outline=[root,(s*.24,.17,1.49),(s*.53,.18,1.67),(s*.73,.18,1.60),(s*.76,.18,1.41),(s*.57,.17,1.20),(s*.38,.16,1.08),(s*.64,.17,.91),(s*.54,.17,.65),(s*.32,.16,.72),(s*.16,.14,.90)]
   for j in range(1,len(outline)-1):plate('Lobed butterfly membrane',[root,outline[j],outline[j+1]],wing if j%2 else pink,'Wing'+side)
   line('Scalloped wing border',outline+[root],.009,metal,'Wing'+side)
   for j in [2,3,4,6,7,8,9]:
    tip=outline[j];mid=Vector(root).lerp(Vector(tip),.57);line('Branching nervure',[root,mid,tip],.0045,glow,'Wing'+side)
   for x,z in [(.53,1.45),(.47,.85)]:
    ell('Wing ocellus',(s*x,.165,z),(.062,.009,.076),cloth,'Wing'+side);jewel((s*x,.148,z),.035,glow,'Wing'+side)
   for j in range(4):
    a=j*1.5;ell('Crown petal',(s*.10+.025*math.cos(a),-.02,headz+.28+.023*math.sin(a)),(.025,.02,.015),silk,'Head')
  line('Flower stem',[(w+.11,-.12,.77),(w+.10,-.12,1.06)],.007,glow,'HandR')
  for j in range(7):ell('Flower corolla',(w+.10+.033*math.cos(TAU*j/7),-.12,1.06+.033*math.sin(TAU*j/7)),(.024,.015,.025),silk,'HandR')
 else:
  # Asymmetric moon collar, hip instruments and full miniature codex.
  for s in [-1,1]:
   plate('Moon collar',[(s*.055,-.08,1.29),(s*.18,.02,1.39),(s*.24,.09,1.24),(s*.10,-.14,1.19)],silk)
  for j in range(3):
   x=-.14+j*.052;loft('Experiment vial',[(.80,.019,.019,x,-.16),(.86,.020,.020,x,-.16),(.88,.01,.01,x,-.16)],glow,'Pelvis',n=12)
  book((w+.11,-.12,.80),cloth,ivory,metal,'HandR')
  for j in range(3):line('Silver stylus',[(-w-.12+j*.016,-.10,.72),(-w-.12+j*.016,-.10,.95)],.005,metal,'HandL')
  line('Crescent hairpin',[(.10+.032*math.cos(i*.22),-.07,headz+.21+.04*math.sin(i*.22)) for i in range(22)],.007,metal,'Head')
 # Sculpted drapery: long elven gown, organic feeric underskirt, asymmetric mage overskirt.
 if not broad:
  rings=[];vs=[];fs=[];n=64
  bottom=.19 if elf else (.47 if fairy else .39)
  for row in range(13):
   t=row/12;z=bottom+(.91-bottom)*t
   radius=(.27 if elf else .24 if fairy else .26)*(1-t)+w*.84*t
   for i in range(n):
    a=TAU*i/n;fold=1+.075*math.cos(a*(12 if elf else 9))*(1-t)
    zz=z+(.045*math.cos(a*5)*(1-t) if fairy else .055*math.sin(a)*(1-t) if mage else 0)
    vs.append((radius*fold*math.cos(a),radius*.64*fold*math.sin(a)+.025,zz))
  for row in range(12):
   for i in range(n):a=row*n+i;b=row*n+(i+1)%n;fs.append((a,b,b+n,a+n))
  mesh('Pleated elven gown' if elf else 'Bellflower skirt' if fairy else 'Asymmetric lunar overskirt',vs,fs,silk if fairy else cloth,'Pelvis')
  for j in range(12 if elf else 7):
   a=j*TAU/(12 if elf else 7);pts=[]
   for row in range(13):
    t=row/12;rr=(.27 if elf else .24 if fairy else .26)*(1-t)+w*.84*t
    zz=bottom+(.91-bottom)*t
    pts.append((rr*1.08*math.cos(a),rr*.64*1.08*math.sin(a)+.025,zz))
   line('Woven hem filigree',pts,.0035,metal if not fairy else glow,'Pelvis')
 if elf:
  for s in [-1,1]:
   strand('Long elven side tress',[(s*.115,.015,headz+.26),(s*.145,.025,headz+.08),(s*.14,.04,1.19),(s*.11,.06,1.05)],[.025,.035,.032,.003],hair,'Head',12)
 if mage:
  # An asymmetric sweep and side knot distinguish the experimental mage from the scholar.
  ell('Loose side knot',(-.145,.055,headz+.18),(.07,.065,.085),hair,'Head')
  for i in range(5):
   strand('Swept mage fringe',[(.07-i*.025,-.02,headz+.31),(.10-i*.034,-.10,headz+.26),(.09-i*.035,-.116,headz+.20-i*.008)],[.02,.027,.001],hair,'Head')
 physical_tools(w,ink,ivory,metal)
 refine_character(who,w,headz,skin,hair,cloth,silk,metal,ivory,ink,glow)
 # Normalize all authored surfaces BEFORE binding. Identity pivot on floor.
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];hi=max(v.co.z for o in meshes for v in o.data.vertices);factor=height/hi
 for o in meshes:
  for v in o.data.vertices:
   v.co*=factor
   if fairy:v.co.z+=.16
 # Anatomical deform rig, real weights/modifiers exported as glTF skins.
 rigdata=bpy.data.armatures.new('InhabitantSkeleton');rig=bpy.data.objects.new(who+'Rig',rigdata);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 coords={'Facing':((0,0,0),(0,0,.15),None),'Pelvis':((0,0,.81),(0,0,.94),'Facing'),'Torso':((0,0,.94),(0,0,1.30),'Pelvis'),'Head':((0,0,1.34),(0,0,1.63),'Torso'),'Magic':((0,0,.61),(0,0,.71),'Facing')}
 for s,side in [(-1,'L'),(1,'R')]:
  coords.update({'Shoulder'+side:((s*w,0,1.25),(s*(w+.06),-.02,1.04),'Torso'),'Elbow'+side:((s*(w+.06),-.02,1.04),(s*(w+.115),-.06,.85),'Shoulder'+side),'Hand'+side:((s*(w+.115),-.06,.85),(s*(w+.115),-.08,.74),'Elbow'+side),'Hip'+side:((s*w*.56,0,.81),(s*w*.56,0,.46),'Pelvis'),'Knee'+side:((s*w*.56,0,.46),(s*w*.56,0,.12),'Hip'+side)})
  if fairy:coords['Wing'+side]=((s*.075,.13,1.15),(s*.5,.17,1.4),'Torso')
 for name,(a,b,parent) in coords.items():
  bone=rigdata.edit_bones.new(name);bone.head=Vector(a)*factor+Vector((0,0,.16 if fairy else 0));bone.tail=Vector(b)*factor+Vector((0,0,.16 if fairy else 0))
  if parent:bone.parent=rigdata.edit_bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT')
 for o in meshes:
  mod=o.modifiers.new('Anatomical skin','ARMATURE');mod.object=rig;o.parent=rig
 # Named contact bones use explicit rest-space coordinates. Bone parenting
 # of an Empty formerly introduced a tail offset in exported hand contacts.
 bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
 for name,parent,xyz in [('socket_carry','HandL',(-w-.115,-.135,.77)),('socket_hand_right','HandR',(w+.115,-.135,.77)),('socket_seat','Pelvis',(0,.03,.705))]:
  socket=rigdata.edit_bones.new(name);socket.head=Vector(xyz)*factor+Vector((0,0,.16 if fairy else 0));socket.tail=socket.head+Vector((0,0,.025));socket.parent=rigdata.edit_bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT')
 # Eight agency-compatible actions; no competing root translation.
 durations={'idle':3.6,'walk':3.2,'turn':2.4,'react':1.8,'gesture':2.8,'work':4.,'magic':3.6,'recover':2.4};bpy.context.scene.render.fps=30
 for clip,duration in durations.items():
  rig.animation_data_create();action=bpy.data.actions.new(who+'_'+clip);rig.animation_data.action=action
  for step in range(33):
   t=step/32;p=math.sin(math.pi*t)**2;wave=math.sin(t*TAU*2);slow=math.sin(t*TAU);frame=1+t*duration*30
   for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0)
   body=rig.pose.bones['Torso'];head=rig.pose.bones['Head'];magic=rig.pose.bones['Magic']
   body.rotation_euler.x=.012*slow;head.rotation_euler.z=.025*slow
   for s,side in [(-1,'L'),(1,'R')]:
    arm=rig.pose.bones['Shoulder'+side];elbow=rig.pose.bones['Elbow'+side];hip=rig.pose.bones['Hip'+side];knee=rig.pose.bones['Knee'+side]
    if clip=='walk':
     stride=.22 if broad or fairy else .34;hip.rotation_euler.x=s*stride*wave;knee.rotation_euler.x=max(0,-s*wave)*.28;arm.rotation_euler.x=-s*.16*wave;body.rotation_euler.z=.022*wave
    elif clip in ['work','gesture','magic','react','recover']:
     intensity={'work':.48,'gesture':.30,'magic':.58,'react':.22,'recover':.20}[clip]
     elbow.rotation_euler.x=-intensity*p*(1.1 if side=='L' else 1);arm.rotation_euler.x=-.16*p;arm.rotation_euler.z=s*.10*p
     if clip=='work':elbow.rotation_euler.x+=.06*wave*p;head.rotation_euler.x=.10*p
     if clip=='gesture' and side=='L':arm.rotation_euler.z=-.48*p;elbow.rotation_euler.x=-.64*p
     if clip=='magic':arm.rotation_euler.z=s*.45*p;head.rotation_euler.x=-.08*p;magic.rotation_euler.z=.12*slow;body.rotation_euler.x=(-.035 if broad else .045)*p
     if clip=='react':head.rotation_euler.z=.12*p;body.rotation_euler.x=-.06*p
     if clip=='recover':head.rotation_euler.z=-.08*p
    if fairy:rig.pose.bones['Wing'+side].rotation_euler.y=s*(.035 if clip=='idle' else .09)*slow
   # Character-specific acting, all under the existing mixer and eight clips.
   left=rig.pose.bones['ShoulderL'];right=rig.pose.bones['ShoulderR'];le=rig.pose.bones['ElbowL'];re=rig.pose.bones['ElbowR']
   if broad:
    if clip=='idle':body.rotation_euler.x=.018*slow;head.rotation_euler.x=-.035+.018*slow;left.rotation_euler.z=-.035;right.rotation_euler.z=.035
    if clip in ['react','magic','recover']:
     body.rotation_euler.x=(-.07 if clip=='react' else .06)*p
     le.rotation_euler.x=-.48*p;re.rotation_euler.x=-.40*p
     left.rotation_euler.z=-.19*p;right.rotation_euler.z=.19*p
     head.rotation_euler.x=-.10*p;head.rotation_euler.z=.035*slow
   elif elf:
    if clip in ['idle','work','gesture','magic']:
     re.rotation_euler.x=-.22-(.38*p if clip in ['work','magic'] else .08*p)
     right.rotation_euler.x=-.08-.10*p
     if clip=='work':
      head.rotation_euler.x=.18*p;head.rotation_euler.z=.045*slow
      le.rotation_euler.x=-.65*p;left.rotation_euler.z=-.15*p;left.rotation_euler.x=-.28*p
     if clip=='magic':le.rotation_euler.x=-.65*p;left.rotation_euler.z=-.25*p;body.rotation_euler.z=.025*slow
   elif fairy:
    for side in ['L','R']:
     rig.pose.bones['Hip'+side].rotation_euler.x=-.13
     rig.pose.bones['Knee'+side].rotation_euler.x=.28+.035*slow
    rig.pose.bones['Facing'].location.y=.012*slow
    body.rotation_euler.x=.025*slow;body.rotation_euler.z=.015*slow
    for sign,side in [(-1,'L'),(1,'R')]:rig.pose.bones['Wing'+side].rotation_euler.y=sign*(.10+.10*math.sin(t*TAU*2))
    if clip=='walk':left.rotation_euler.z=-.13;right.rotation_euler.z=.13
   else:
    if clip in ['gesture','magic','recover']:
     flourish=math.sin(t*TAU*1.5)*p
     left.rotation_euler.z=-.35*p;left.rotation_euler.x=-.25*p
     le.rotation_euler.x=-.68*p+.13*flourish
     right.rotation_euler.z=.22*p;re.rotation_euler.x=-.38*p
     head.rotation_euler.z=.10*flourish;body.rotation_euler.z=.07*slow*p
     magic.rotation_euler.z=.20*slow
   if clip=='turn':rig.pose.bones['Facing'].rotation_euler.y=.9*p
   for b in rig.pose.bones:b.keyframe_insert('rotation_euler',frame=frame,group=b.name)
   if fairy:rig.pose.bones['Facing'].keyframe_insert('location',frame=frame,group='Facing')
  for f in action.fcurves:
   for k in f.keyframe_points:k.interpolation='BEZIER'
  track=rig.animation_data.nla_tracks.new();track.name=clip;strip=track.strips.new(clip,1,action);strip.name=clip;rig.animation_data.action=None;track.mute=True
 physical_clips(rig,meshes,factor,who)
 for b in rig.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0)
 bpy.context.scene.frame_set(1);bpy.context.preferences.filepaths.save_version=0
 bpy.ops.wm.save_as_mainfile(filepath=OUT+'/'+who+'.blend')
 # Join by material while preserving per-vertex bone weights. Editable source stays separate.
 groups=[[o for o in meshes if o.active_material==m] for m in list(bpy.data.materials)]
 for objects in groups:
  if not objects:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0]
  if len(objects)>1:bpy.ops.object.join()
  bpy.context.object.name=who+'_'+bpy.context.object.active_material.name
 for track in rig.animation_data.nla_tracks:track.mute=False
 bpy.ops.export_scene.gltf(filepath=DEST+'/'+who+'.glb',export_format='GLB',export_animations=True,export_force_sampling=True,export_nla_strips=True,export_skins=True,export_all_influences=False)
for key,h in [('samael',2),('aryn',1.7),('ytha',1.32),('lua',1.6)]:build(key,h)
# Manifest always describes the bytes just exported, not an older generation.
import hashlib, json, struct
manifest={}
for key in ['samael','aryn','ytha','lua']:
 data=open(DEST+'/'+key+'.glb','rb').read();document=json.loads(data[20:20+struct.unpack_from('<I',data,12)[0]])
 manifest[key]={'file':'src/features/library/three/assets/'+key+'.glb','sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'meshes':len(document['meshes']),'triangles':sum(document['accessors'][p['indices']]['count']//3 for m in document['meshes'] for p in m['primitives']),'clips':len(document['animations']),'skins':len(document['skins']),'bones':len(document['skins'][0]['joints'])}
with open(OUT+'/manifest.json','w') as output:json.dump(manifest,output,indent=2);output.write('\n')
