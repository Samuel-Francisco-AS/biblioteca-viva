"""BF-5.5G: authored locomotion, baked into the existing rig/mixer.

Blender -Y is forward, Z is up. Navigation still owns the root on the floor.
Grounded strides use the agency's metres/second and a 0.8 s gait cycle;
stance feet move backwards at that speed in local space, cancelling travel.
No runtime IK, new bones, lights or physical contact actions.
"""

def plant_leg(rig, side, target):
 upper=rig.pose.bones['Hip'+side];lower=rig.pose.bones['Knee'+side]
 head=upper.matrix.translation.copy();direction=target-head;distance=direction.length
 a=rig.data.bones[upper.name].length;b=rig.data.bones[lower.name].length
 if distance>=a+b:raise RuntimeError('Unreachable stride: '+side+' '+str(distance))
 unit=direction.normalized();pole=Vector((0,-1,0));pole=(pole-unit*pole.dot(unit)).normalized()
 cosine=(a*a+distance*distance-b*b)/(2*a*distance)
 knee=head+unit*(a*cosine)+pole*(a*math.sqrt(max(0,1-cosine*cosine)))
 for bone,start,end in [(upper,head,knee),(lower,knee,target)]:
  rotation=bone.matrix.to_quaternion();current=rotation@Vector((0,1,0))
  matrix=(current.rotation_difference((end-start).normalized())@rotation).to_matrix().to_4x4()
  matrix.translation=start;bone.matrix=matrix;bpy.context.view_layer.update()
 foot=rig.pose.bones['Foot'+side];matrix=rig.data.bones[foot.name].matrix_local.copy()
 matrix.translation=target;foot.matrix=matrix

def refine_locomotion(rig, factor, who):
 fairy=who=='ytha';broad=who=='samael';elf=who=='aryn'
 clips=['walk','carry_walk']+(['idle','turn'] if fairy else [])
 for clip in clips:
  track=next(t for t in rig.animation_data.nla_tracks if t.name==clip)
  original=track.strips[0].action;rig.animation_data.action=original
  duration=(original.frame_range[1]-original.frame_range[0])/30
  samples=[]
  for step in range(129):
   t=step/128;frame=1+t*duration*30
   bpy.context.scene.frame_set(int(frame),subframe=frame-int(frame));bpy.context.view_layer.update()
   pelvis=rig.pose.bones['Pelvis'];body=rig.pose.bones['Torso'];head=rig.pose.bones['Head'];facing=rig.pose.bones['Facing']
   phase=t*duration/.8;wave=math.sin(phase*TAU)
   if fairy:
    # Correct the old Facing local-Y sway: Facing's local Y is world height.
    # Hover never translates X/Z, never changes the agency root/envelope.
    flight=clip in ['walk','carry_walk'];slow=math.sin(t*TAU*2)
    facing.location=(0,.055+.032*slow if flight else .026+.024*math.sin(t*TAU),0)
    pelvis.rotation_euler.x=-.10 if flight else -.035
    pelvis.rotation_euler.z=.025*math.sin(t*TAU*2)
    body.rotation_euler.x=.055 if flight else .015*slow
    body.rotation_euler.z=-.018*math.sin(t*TAU*2)
    head.rotation_euler.x=-.035 if flight else -.015*slow
    for sign,side in [(-1,'L'),(1,'R')]:
     rig.pose.bones['Hip'+side].rotation_euler.x=-.16+sign*.035*slow
     rig.pose.bones['Knee'+side].rotation_euler.x=.34+sign*.045*math.sin(t*TAU*2-.5)
     # Six wingbeats in 3.2 s, smaller resting wingbeats; closed loop.
     wing=rig.pose.bones['Wing'+side];wing.rotation_euler=(0,0,0)
     bpy.context.view_layer.update()
     # A flap hinges around the body's vertical axis. Rotating the diagonal
     # wing bone's local Y merely twists the membrane and reads as rigid.
     matrix=wing.matrix.copy();hinge=Matrix.Rotation(sign*(.12+(.50 if flight else .30)*math.sin(t*TAU*(6 if flight else 4))),4,'Z')
     wing.matrix=Matrix.Translation(matrix.translation)@hinge@matrix.to_quaternion().to_matrix().to_4x4()
     if clip!='carry_walk':
      arm=rig.pose.bones['Shoulder'+side];elbow=rig.pose.bones['Elbow'+side]
      arm.rotation_euler.x=.12 if flight else .025*slow
      arm.rotation_euler.z=sign*(.15+.025*slow);elbow.rotation_euler.x=-.20-.045*slow
   else:
    speed={'samael':.95,'aryn':1.22,'lua':1.13}[who]
    stance=.60;excursion=speed*.8*stance/2
    leg=.69*factor
    drop=leg-math.sqrt(leg*leg-excursion*excursion)+.012*factor
    pelvis.location=(.010*wave if broad else .014*wave,-drop+.008*factor*(1-math.cos(phase*TAU*2)),0)
    pelvis.rotation_euler.z=(.012 if broad else .020)*wave
    body.rotation_euler.z=-(.018 if broad else .026)*wave
    body.rotation_euler.x=.035 if broad else .018
    head.rotation_euler.z=.006*wave
    if clip=='walk':
     for sign,side in [(-1,'L'),(1,'R')]:
      arm=rig.pose.bones['Shoulder'+side];elbow=rig.pose.bones['Elbow'+side]
      arm.rotation_euler.x=-sign*(.12 if broad else .15 if elf else .21)*wave
      arm.rotation_euler.z=sign*(.045 if broad else .025)
      elbow.rotation_euler.x=-.12-(.035 if broad else .06)*(1+sign*wave)
    bpy.context.view_layer.update()
    for offset,side in [(0,'L'),(.5,'R')]:
     q=(phase+offset)%1
     if q<stance:y=-excursion+speed*.8*q;lift=0
     else:
      u=(q-stance)/(1-stance);ease=u*u*(3-2*u)
      y=excursion-2*excursion*ease;lift=(.055 if broad else .075 if elf else .09)*factor*math.sin(math.pi*u)**2
     target=rig.data.bones['Foot'+side].head_local.copy();target.y+=y;target.z+=lift
     plant_leg(rig,side,target)
     drape=rig.pose.bones['Drape'+side];drape.rotation_euler.x=.10*math.sin((phase+offset)*TAU-.4)
   bpy.context.view_layer.update()
   samples.append((frame,[(b.name,b.rotation_euler.copy(),b.location.copy(),b.scale.copy()) for b in rig.pose.bones]))
  rig.animation_data.nla_tracks.remove(track)
  action=bpy.data.actions.new(who+'_'+clip+'_G');rig.animation_data.action=action
  for frame,pose in samples:
   for name,rotation,location,scale in pose:
    bone=rig.pose.bones[name];bone.rotation_euler=rotation;bone.location=location;bone.scale=scale
    for channel in ['rotation_euler','location','scale']:bone.keyframe_insert(channel,frame=frame,group=name)
  for f in action.fcurves:
   for k in f.keyframe_points:k.interpolation='LINEAR'
  track=rig.animation_data.nla_tracks.new();track.name=clip;strip=track.strips.new(clip,1,action);strip.name=clip;track.mute=True
  rig.animation_data.action=None;bpy.data.actions.remove(original)
