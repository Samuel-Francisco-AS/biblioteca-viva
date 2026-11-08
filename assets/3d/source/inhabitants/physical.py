"""F2 physical clips. Original R5 actions/identities are retained.
Seat contact is 0.42 m. Hip/knee rotations keep soles fixed throughout the
lowering; the pelvis moves back by the thigh's horizontal excursion.
"""

def physical_tools(w,ink,ivory,metal):
 x=-w-.115
 # A material drawing/repair board and a stylus, not a second personal book.
 mesh('Functional board',[(x-.05,-.18,.755),(x+.25,-.18,.755),(x+.25,-.30,.755),(x-.05,-.30,.755)],[(0,1,2,3)],ink,'HandL')
 mesh('Functional paper',[(x-.04,-.19,.77),(x+.24,-.19,.77),(x+.24,-.29,.77),(x-.04,-.29,.77)],[(0,1,2,3)],ivory,'HandL')
 for y in [-.21,-.235,-.26]:line('Functional guide',[(x-.01,y,.771),(x+.18,y,.771)],.0015,metal,'HandL')
 x=w+.115
 strand('Functional stylus',[(x,-.06,.69),(x,-.06,.84),(x,-.06,.96)],[.001,.008,.009],metal,'HandR',8)

def solve_physical_arm(rig,side,target,pole=None):
 upper=rig.pose.bones['Shoulder'+side];lower=rig.pose.bones['Elbow'+side]
 head=upper.matrix.translation.copy();direction=target-head;distance=direction.length
 a=rig.data.bones['Shoulder'+side].length;b=rig.data.bones['Elbow'+side].length
 if distance>=a+b:raise RuntimeError('Unreachable physical tool target: '+side+' '+str(distance)+' > '+str(a+b))
 unit=direction.normalized()
 if pole is None:pole=Vector((-.8 if side=='L' else .8,.05,-.3))
 pole=(pole-unit*pole.dot(unit)).normalized()
 cosine=(a*a+distance*distance-b*b)/(2*a*distance)
 elbow=head+unit*(a*cosine)+pole*(a*math.sqrt(max(0,1-cosine*cosine)))
 for bone,start,end in [(upper,head,elbow),(lower,elbow,target)]:
  rotation=bone.matrix.to_quaternion();current=rotation@Vector((0,1,0))
  rotation=current.rotation_difference((end-start).normalized())@rotation
  matrix=rotation.to_matrix().to_4x4();matrix.translation=start;bone.matrix=matrix
  bone.keyframe_insert('rotation_euler',frame=bpy.context.scene.frame_current_final,group=bone.name)
  bone.keyframe_insert('location',frame=bpy.context.scene.frame_current_final,group=bone.name)
  bpy.context.view_layer.update()

def physical_clips(rig, meshes, factor, who):
 fairy=who=='ytha'; broad=who=='samael'
 # Scenic hand accessories have their own deform bones. During physical work
 # they are stowed alongside the hip; the real hand sockets remain unoccupied.
 bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
 for side in ['L','R']:
  bone=rig.data.edit_bones.new('Prop'+side);hand=rig.data.edit_bones['Hand'+side]
  bone.head=hand.head;bone.tail=hand.tail;bone.parent=hand
 for side in ['L','R']:
  bone=rig.data.edit_bones.new('Tool'+side);hand=rig.data.edit_bones['Hand'+side]
  bone.head=hand.head;bone.tail=hand.tail;bone.parent=hand
 for side in ['L','R']:
  bone=rig.data.edit_bones.new('Foot'+side);knee=rig.data.edit_bones['Knee'+side]
  bone.head=knee.tail;bone.tail=bone.head+Vector((0,-.1,0));bone.parent=knee
 for side in ['L','R']:
  bone=rig.data.edit_bones.new('Drape'+side);hip=rig.data.edit_bones['Hip'+side]
  bone.head=hip.head;bone.tail=hip.tail;bone.parent=hip
 bpy.ops.object.mode_set(mode='OBJECT')
 for o in meshes:
  if any(k in o.name for k in ['coat front','Coat back','hem','gown','skirt','petal','apron','filigree','cape panel']):
   for v in o.data.vertices:
    z=(v.co.z-(.16 if fairy else 0))/factor
    t=max(0,min(1,(.90-z)/.06))
    if t<=0:continue
    for g in list(v.groups):o.vertex_groups[g.group].remove([v.index])
    side='L' if v.co.x<0 else 'R'
    for name,weight in [('Pelvis',1-t),(('Drape' if v.co.y>0 else 'Hip')+side,t)]:
     group=o.vertex_groups.get(name) or o.vertex_groups.new(name=name)
     if weight>0:group.add([v.index],weight,'REPLACE')
 for o in meshes:
  if o.name.startswith('Functional'):
   for side in ['L','R']:
    group=o.vertex_groups.get('Hand'+side)
    if group:group.name='Tool'+side
 for o in meshes:
  if 'boot' in o.name.lower():
   for side in ['L','R']:
    group=o.vertex_groups.get('Knee'+side)
    if group:group.name='Foot'+side
 for o in meshes:
  if not any(k.lower() in o.name.lower() for k in ['Palm','finger','claw','thumb','sleeve','cuff']):
   for side in ['L','R']:
    old=o.vertex_groups.get('Hand'+side)
    if old:old.name='Prop'+side
 durations={'pickup':1.6,'carry':3.,'carry_walk':3.2,'sit':2.,'seated':4.,'read_seated':4.,'study_seated':4.,'stand':2.,'workshop':4.,'train':5.,'watch':4.}
 grasp_rotations={}
 for clip,duration in durations.items():
  rig.animation_data_create();action=bpy.data.actions.new(who+'_'+clip);rig.animation_data.action=action
  for step in range(33):
   t=step/32;u=t*t*(3-2*t);wave=math.sin(t*TAU);pulse=math.sin(t*TAU*2);frame=1+t*duration*30
   bpy.context.scene.frame_set(int(frame),subframe=frame-int(frame))
   for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0);b.scale=(1,1,1)
   pelvis=rig.pose.bones['Pelvis'];body=rig.pose.bones['Torso'];head=rig.pose.bones['Head']
   sitting=clip in ['sit','stand','seated','read_seated','study_seated']
   s=u if clip=='sit' else 1-u if clip=='stand' else 1 if sitting else 0
   # World seat target, accounting for each anatomical scale and fairy hover.
   hip_height=.42+.105*factor
   lower=.46*factor+(.16 if fairy else 0)
   angle=math.acos(max(-1,min(1,(hip_height-lower)/(.35*factor))))*s
   drop=.35*factor*(1-math.cos(angle))
   back=.35*factor*math.sin(angle)
   # Bone's local Y is world Z. Its local Z is -world Y.
   pelvis.location.y=-drop;pelvis.location.z=-back
   body.rotation_euler.x=.07*s;head.rotation_euler.x=.10*s
   for sign,side in [(-1,'L'),(1,'R')]:
    hip=rig.pose.bones['Hip'+side];knee=rig.pose.bones['Knee'+side];arm=rig.pose.bones['Shoulder'+side];elbow=rig.pose.bones['Elbow'+side]
    hip.rotation_euler.x=-angle;knee.rotation_euler.x=angle
    # Rest both forearms over the lap, clear of the cushion and thighs.
    arm.rotation_euler.x=-.45-.03*s;elbow.rotation_euler.x=-1.02+.12*s;arm.rotation_euler.z=sign*.04*s
    if clip in ['pickup','carry','carry_walk']:
     reach=math.sin(math.pi*t)**2 if clip=='pickup' else 0
     rig.pose.bones['Facing'].rotation_euler.x=.12*reach
     pelvis.rotation_euler.x=.9*reach;hip.rotation_euler.x=-.9*reach
     body.rotation_euler.x=.5*reach;head.rotation_euler.x=-.25*reach
     rig.pose.bones['Foot'+side].rotation_euler.x=-.12*reach
     arm.rotation_euler.x=-.45-1.95*reach;elbow.rotation_euler.x=-1.02+.72*reach
     if clip=='carry_walk':
      hip.rotation_euler.x=sign*.19*pulse;knee.rotation_euler.x=max(0,-sign*pulse)*.22
    if clip in ['read_seated','study_seated']:
     head.rotation_euler.x=.20+.018*wave
     if side=='R':elbow.rotation_euler.x+=.07*pulse;arm.rotation_euler.x+=.025*wave
    if clip=='workshop':
     arm.rotation_euler.x=-.85;elbow.rotation_euler.x=-.75+(.18*pulse if side=='R' else .025*wave)
     body.rotation_euler.x=.22;head.rotation_euler.x=.22
    if clip=='train':
     # Daily mobility: squat/extend and shoulder rotation, no battle effects.
     q=.5-.5*math.cos(t*TAU*2)
     hip.rotation_euler.x=0;knee.rotation_euler.x=0
     arm.rotation_euler.x=-.65*q;elbow.rotation_euler.x=-.10-.20*q;arm.rotation_euler.z=sign*(.12+.28*q)
     body.rotation_euler.x=.12*q
    if clip=='watch':head.rotation_euler.z=.055*wave;head.rotation_euler.x=-.035+.025*pulse;arm.rotation_euler.x=-.05;elbow.rotation_euler.x=-.12
    if fairy:rig.pose.bones['Wing'+side].rotation_euler.y=sign*(.06+.025*wave+.65*s)
   for b in rig.pose.bones:
    b.keyframe_insert('rotation_euler',frame=frame,group=b.name);b.keyframe_insert('location',frame=frame,group=b.name)
   bpy.context.view_layer.update()
   if clip=='pickup':
    reach=math.sin(math.pi*t)**2
    for side in ['L','R']:
     wrist=rig.pose.bones['Hand'+side].matrix.translation.copy()
     pole=rig.pose.bones['Elbow'+side].matrix.translation-rig.pose.bones['Shoulder'+side].matrix.translation
     solve_physical_arm(rig,side,wrist+Vector((0,0,.025*reach)),pole)
   if clip in ['study_seated','workshop']:
    pad=(hip_height if clip=='study_seated' else .81*factor+(.16 if fairy else 0))+.22*factor
    for side in ['L','R']:
     target=Vector(((-.10 if side=='L' else .08+.025*wave)*factor,back+(-.15 if side=='L' else -.30+.01*pulse)*factor,pad+(.08 if side=='L' else .16)*factor))
     solve_physical_arm(rig,side,target)
   for side in ['L','R']:
    tool=rig.pose.bones['Tool'+side];tool.scale=(1,1,1) if clip in ['study_seated','workshop'] else (0,0,0)
    tool.keyframe_insert('scale',frame=frame,group=tool.name)
    hand=rig.pose.bones['Hand'+side]
    if clip=='pickup' and step==16:grasp_rotations[side]=hand.matrix.to_quaternion()
    if side in grasp_rotations and (clip!='pickup' or step>=16):
     position=hand.matrix.translation.copy()
     hand.matrix=grasp_rotations[side].to_matrix().to_4x4();hand.matrix.translation=position
     hand.keyframe_insert('rotation_euler',frame=frame,group=hand.name)
     hand.keyframe_insert('location',frame=frame,group=hand.name)
    bpy.context.view_layer.update()
    if clip in ['study_seated','workshop']:
     # The tool inherits the true hand position; neutral object orientation
     # keeps the board horizontal and the stylus tip in contact with its face.
     matrix=rig.data.bones['Tool'+side].matrix_local.copy()
     matrix.translation=rig.pose.bones['Hand'+side].matrix.translation
     tool.matrix=matrix
     tool.keyframe_insert('rotation_euler',frame=frame,group=tool.name)
     tool.keyframe_insert('location',frame=frame,group=tool.name)
    if clip=='pickup':
     foot=rig.pose.bones['Foot'+side];matrix=rig.data.bones['Foot'+side].matrix_local.copy()
     matrix.translation=rig.data.bones['Foot'+side].head_local
     foot.matrix=matrix;foot.keyframe_insert('location',frame=frame,group=foot.name)
    drape=rig.pose.bones['Drape'+side];matrix=drape.matrix.copy()
    matrix.translation.z+=.30*factor*s;drape.matrix=matrix
    drape.keyframe_insert('location',frame=frame,group=drape.name)
   # Resolve accessories into a stable hip holster in armature space, while
   # retaining their original model geometry and continuous transition.
   bpy.context.view_layer.update()
   stow=1
   for sign,side in [(-1,'L'),(1,'R')]:
    prop=rig.pose.bones['Prop'+side]
    target=rig.data.bones["Prop"+side].matrix_local.copy();target.translation=Vector((sign*(.32 if not broad else .43)*factor,.04*factor,(1.05*factor+(.16 if fairy else 0))))+Vector((0,back,-drop))
    prop.matrix=prop.matrix.lerp(target,stow)
   for b in rig.pose.bones:
    b.keyframe_insert('rotation_euler',frame=frame,group=b.name);b.keyframe_insert('location',frame=frame,group=b.name)
  for f in action.fcurves:
   for k in f.keyframe_points:k.interpolation='LINEAR'
  track=rig.animation_data.nla_tracks.new();track.name=clip;strip=track.strips.new(clip,1,action);strip.name=clip;rig.animation_data.action=None;track.mute=True

 # Exporters must not inherit a transient position from another NLA strip.
 # Preserve original rotation curves and fairy hover; explicitly key neutral
 # channels added by F2, including hidden functional tools.
 for clip in ['idle','walk','turn','react','gesture','work','magic','recover']:
  action=bpy.data.actions.get(who+'_'+clip);rig.animation_data.action=action
  frames=[action.frame_range[0],action.frame_range[1]]
  for bone in rig.pose.bones:
   bone.scale=(0,0,0) if bone.name.startswith('Tool') else (1,1,1)
   has_location=any(f.data_path==bone.path_from_id('location') for f in action.fcurves)
   if not has_location:bone.location=(0,0,0)
   new_bone=bone.name.startswith(('Tool','Prop','Drape','Foot','socket_'))
   if new_bone:bone.rotation_euler=(0,0,0)
   for frame in frames:
    bone.keyframe_insert('scale',frame=frame,group=bone.name)
    if not has_location:bone.keyframe_insert('location',frame=frame,group=bone.name)
    if new_bone:bone.keyframe_insert('rotation_euler',frame=frame,group=bone.name)
 rig.animation_data.action=None
 for bone in rig.pose.bones:bone.scale=(1,1,1)
