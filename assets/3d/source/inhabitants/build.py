"""Original BF-4F1 character sources. Run from repository root with Blender 3.3.
No external assets. Coordinates: X width, -Y front, Z up; meters.
"""
import bpy, math, os
from mathutils import Vector
ROOT=os.getcwd()
OUT=os.path.join(ROOT,'assets/3d/source/inhabitants')
GLB=os.path.join(ROOT,'src/features/library/three/assets')
def material(name, color, emission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=.72
    p.inputs['Emission'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
    return m
def finish(o,name,mat,parent=None):
    o.name=name; o.data.materials.append(mat)
    if parent: o.parent=parent
    for p in o.data.polygons: p.use_smooth=True
    return o
def ell(name,pos,scale,mat,parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=pos)
    o=bpy.context.object; o.scale=scale; return finish(o,name,mat,parent)
def tube(name,points,r,mat,parent=None):
    c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=r; c.bevel_resolution=1; c.resolution_u=3
    s=c.splines.new('BEZIER'); s.bezier_points.add(len(points)-1)
    for b,p in zip(s.bezier_points,points): b.co=p; b.handle_left_type='AUTO'; b.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active=o; o.select_set(True); bpy.ops.object.convert(target='MESH'); o.select_set(False)
    return finish(o,name,mat,parent)
def profile(name,rings,mat,parent=None):
    verts=[]; faces=[]; n=16
    for z,rx,ry,cx,cy in rings:
        verts.extend((cx+rx*math.cos(i*2*math.pi/n),cy+ry*math.sin(i*2*math.pi/n),z) for i in range(n))
    for j in range(len(rings)-1):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n; faces.append((a,b,b+n,a+n))
    faces.extend([tuple(reversed(range(n))),tuple((len(rings)-1)*n+i for i in range(n))])
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o); return finish(o,name,mat,parent)
def box(name,pos,size,mat,parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos); o=bpy.context.object; o.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mod=o.modifiers.new('Soft edges','BEVEL');mod.width=.015;mod.segments=2
    bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,mat,parent)
def book(name,pos,mat,ivory,parent=None):
    x,y,z=pos
    box(name+' pages',(x,y,z),(.24,.10,.32),ivory,parent)
    for dy in [-.065,.065]: box(name+' cover',(x,y+dy,z),(.27,.025,.35),mat,parent)
    box(name+' spine',(x-.13,y,z),(.025,.15,.35),mat,parent)
for who,height in [('samael',2),('aryn',1.7),('ytha',1.7),('lua',1.6)]:
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    skin=material('Skin',(.07,.055,.09) if who=='samael' else (.78,.58,.47))
    hair=material('Hair', {'samael':(.025,.02,.04),'aryn':(.035,.025,.025),'ytha':(.55,.19,.42),'lua':(.13,.15,.26)}[who])
    cloth=material('Cloth',{'samael':(.035,.025,.055),'aryn':(.055,.20,.14),'ytha':(.35,.20,.42),'lua':(.24,.035,.11)}[who])
    trim=material('Embroidery',(.58,.37,.12)); ivory=material('Paper and linen',(.85,.77,.57)); dark=material('Ink',(.018,.015,.025))
    glow=material('Signature',{'samael':(.37,.12,.65),'aryn':(.85,.71,.34),'ytha':(.40,.64,.32),'lua':(.32,.39,.8)}[who],.6)
    bpy.ops.object.empty_add();root=bpy.context.object;root.name=who
    # Purpose-shaped anatomical volumes and tailored clothing, normalized after construction.
    broad=who=='samael'; compact=who=='lua'; w=.29 if broad else (.21 if compact else .17)
    for s in [-1,1]:
        ell('Boot',(s*w*.55,-.055,.10),(.11 if broad else .075,.17,.10),dark,root)
        profile('Trouser leg',[(.13,.075,.08,s*w*.55,0),(.48,.085,.085,s*w*.55,0),(.80,.10,.10,s*w*.5,0)],cloth,root)
    profile('Tailored coat' if broad else 'Layered dress',[(.42,w*1.25,.19,0,.02),(.65,w*1.10,.16,0,0),(.94,w*.82,.13,0,0),(1.20,w*1.12,.18,0,0),(1.31,w,.14,0,0)],cloth,root)
    profile('Waist sash',[(.89,w*.87,.143,0,0),(.95,w*.86,.145,0,0)],trim,root)
    # Long separate lapels and front piping.
    for s in [-1,1]:
        tube('Lapel',[(s*w*.85,-.12,1.30),(s*w*.5,-.185,1.15),(s*.035,-.145,.94)],.027,ivory if who=='aryn' else trim,root)
        tube('Sleeve',[(s*w*.95,0,1.24),(s*(w+.10),-.025,1.03),(s*(w+.13),-.11,.86)],.105 if broad else .062,cloth,root)
        ell('Hand',(s*(w+.13),-.12,.81),(.075 if broad else .046,.055,.09),skin,root)
        for i in range(3): tube('Finger',[(s*(w+.11)+i*.018,-.155,.82),(s*(w+.11)+i*.018,-.16,.76)],.012,skin,root)
    ell('Neck',(0,0,1.34),(.075,.07,.13),skin,root)
    bpy.ops.object.empty_add(location=(0,0,1.36));head=bpy.context.object;head.name='Head';head.parent=root
    # Head-local coordinates: jaw, cheeks and brow independently shaped.
    profile('Face',[(-.015,.075,.075,0,-.01),(.035,.12,.10,0,-.01),(.14,.14,.115,0,0),(.25,.125,.10,0,.01),(.29,.065,.06,0,.01)],skin,head)
    ell('Hair crown',(0,.025,.245),(.145,.12,.105),hair,head)
    for s in [-1,1]:
        ell('Eye white',(s*.056,-.106,.154),(.032,.018,.020),ivory,head)
        ell('Iris',(s*.056,-.122,.153),(.012,.006,.014),glow,head)
        tube('Brow',[(s*.027,-.119,.191),(s*.06,-.122,.199),(s*.092,-.11,.189)],.009,hair,head)
    ell('Nose',(0,-.118,.11),(.023,.032,.042),skin,head)
    tube('Mouth',[(-.035,-.108,.053),(0,-.117,.048),(.035,-.108,.057)],.005,dark,head)
    for i in range(7):
        x=(i-3)*.037
        tube('Swept hair',[(x,.035,.32),(x*1.05,-.075,.29),(x*1.12,-.10,.22 if i<4 else .26)],.027,hair,head)
    if who in ['aryn','lua']:
        for s in [-1,1]:
            pts=[(s*.061+.045*math.cos(i*math.pi/8),-.137,.153+.036*math.sin(i*math.pi/8)) for i in range(17)]
            tube('Spectacles',pts,.006,trim if who=='aryn' else ivory,head)
        tube('Bridge',[(-.017,-.139,.16),(.017,-.139,.16)],.006,trim,head)
    if who=='samael':
        smoke=material('Shadow aura',(.018,.009,.03))
        smoke.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.34
        smoke.blend_method='BLEND'
        for sign in [-1,1]:
            tube('Shadow wisp',[(sign*.37,.12,.30),(sign*.47,.12,.63),(sign*.42,.12,1.0),(sign*.36,.12,1.30)],.065,smoke,root)
            tube('Violet wisp',[(sign*.40,.10,.44),(sign*.48,.10,.68),(sign*.41,.10,.89)],.009,glow,root)
        for s in [-1,1]:
            tube('Curved horn',[(s*.10,.02,.27),(s*.17,.04,.39),(s*.16,.07,.47)],.035,dark,head)
            tube('Lilac fissure',[(s*.11,-.075,.06),(s*.10,-.105,.10),(s*.12,-.075,.14)],.008,glow,head)
        box('Closed notebook',(.30,-.14,.70),(.29,.07,.39),dark,root)
        box('Notebook sigil',(.30,-.182,.73),(.08,.01,.08),glow,root)
        ell('Coffee cup',(-.40,-.14,.86),(.064,.064,.075),ivory,root)
    elif who=='aryn':
        for s in [-1,1]:
            tube('Elven ear',[(s*.12,0,.12),(s*.21,.015,.23)],.035,skin,head)
        ell('Tied hair',(0,.13,.15),(.10,.075,.16),hair,head)
        book('Anatomy folio',(.25,-.15,.77),cloth,ivory,root)
        box('Restoration apron',(0,-.163,.77),(.24,.025,.33),ivory,root)
        for x in [-.07,0,.07]: tube('Repair tool',[(x,-.19,.74),(x,-.19,.89)],.012,trim,root)
    elif who=='ytha':
        wing=material('Translucent wing',(.38,.62,.43),.15)
        wing.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.58
        wing.blend_method='BLEND'
        for s in [-1,1]:
            # Butterfly outline with upper and lower lobes, visibly unlike a cape.
            pts=[(s*.10,.13,1.13),(s*.46,.16,1.63),(s*.74,.18,1.58),(s*.70,.18,1.24),(s*.44,.16,1.04),(s*.62,.17,.81),(s*.45,.16,.64),(s*.18,.14,.86)]
            mesh=bpy.data.meshes.new('Wing');mesh.from_pydata(pts,[],[tuple(range(8))]);mesh.update()
            o=bpy.data.objects.new('Butterfly wing',mesh);bpy.context.collection.objects.link(o);finish(o,'Butterfly wing',wing,root)
            tube('Wing rim',pts+[pts[0]],.017,cloth,root)
            for p in [pts[2],pts[4],pts[6]]:tube('Wing vein',[pts[0],p],.009,ivory,root)
            for z in [.7,.85,1.0]:ell('Petal skirt',(s*.14,-.08,z),(.12,.12,.22),cloth,root)
            tube('Long rose hair',[(s*.10,.06,.25),(s*.15,.07,.05),(s*.13,.08,-.20)],.048,hair,head)
        tube('Botanical stem',[(.28,-.18,.75),(.26,-.18,1.12)],.01,glow,root)
        for i in range(5):ell('Flower petal',(.26+.035*math.cos(i*1.257),-.19,1.12+.035*math.sin(i*1.257)),(.028,.015,.026),hair,root)
    else:
        book('Grimoire',(.25,-.19,.82),cloth,ivory,root)
        tube('Silver crescent',[(.25+.065*math.cos(i*.3),-.27,.84+.065*math.sin(i*.3)) for i in range(15)],.009,ivory,root)
        for i in range(3):tube('Drawing pencil',[(-.27+i*.025,-.13,.74),(-.30+i*.025,-.14,.99)],.008,trim,root)
        profile('Academic cape',[(.68,.29,.11,0,.12),(1.17,.26,.16,0,.10),(1.30,.20,.11,0,.03)],cloth,root)
        for s in [-1,1]:tube('Bob hair',[(s*.11,.04,.25),(s*.15,.04,.10),(s*.14,.03,-.07)],.05,hair,head)
    # Small luminous signature motes; geometry only, no lamps/postprocessing.
    for i in range(5):
        a=i*1.256;ell('Aura mote',(.36*math.cos(a),.23*math.sin(a),.7+i*.13),(.015,.015,.026),glow,root)
    # Bake metric scale into authored coordinates, retain identity scene root.
    bpy.context.view_layer.update()
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    high=max((o.matrix_world@Vector(c)).z for o in meshes for c in o.bound_box)
    factor=height/high
    for o in meshes:
        matrix=o.matrix_world.copy()
        for v in o.data.vertices: v.co=matrix@v.co*factor
        o.parent=None;o.matrix_world.identity()
    # Reparent head meshes preserving world placement, then animate a rigid nod.
    head.location=(0,0,1.36*factor)
    bpy.context.view_layer.update()
    for o in meshes:
        o.parent=root
    # Source retains named head pieces; one deliberate subtle nod on entire upper face.
    for o in meshes:
        if o.name.startswith(('Face','Eye','Iris','Nose','Mouth','Brow','Hair','Swept','Spectacles','Bridge','Curved horn','Elven ear','Long rose','Bob hair','Tied hair','Lilac fissure')):
            o.parent=head;o.matrix_parent_inverse=head.matrix_world.inverted()
    head.rotation_mode='XYZ'
    for frame,angle in [(1,0),(45,.025),(90,0)]:
        head.rotation_euler.x=angle;head.keyframe_insert(data_path='rotation_euler',frame=frame)
    bpy.context.scene.frame_end=90;bpy.context.scene.frame_set(1)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,who+'.blend'))
    # Measured browser slowdown justified batching rigid pieces by material/parent.
    # The saved .blend above retains every editable piece.
    groups={}
    for o in list(bpy.context.scene.objects):
        if o.type=='MESH': groups.setdefault((o.parent,o.active_material),[]).append(o)
    for (parent,mat),objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects: o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1: bpy.ops.object.join()
        bpy.context.object.name=('Head-' if parent==head else 'Body-')+mat.name
    bpy.ops.export_scene.gltf(filepath=os.path.join(GLB,who+'.glb'),export_format='GLB',export_animations=True,export_force_sampling=True)
# Keep the audit manifest coupled to the exact exported bytes.
import hashlib, json, struct
manifest={}
for name in ['samael','aryn','ytha','lua']:
    path=os.path.join(GLB,name+'.glb')
    with open(path,'rb') as source: data=source.read()
    length=struct.unpack_from('<I',data,12)[0]
    document=json.loads(data[20:20+length])
    manifest[name]={
        'file':'src/features/library/three/assets/'+name+'.glb',
        'sha256':hashlib.sha256(data).hexdigest(), 'bytes':len(data),
        'meshes':len(document['meshes']),
        'triangles':sum(document['accessors'][p['indices']]['count']//3 for m in document['meshes'] for p in m['primitives']),
        'clips':len(document.get('animations',[])),
    }
with open(os.path.join(OUT,'manifest.json'),'w') as output:
    json.dump(manifest,output,indent=2); output.write('\n')
