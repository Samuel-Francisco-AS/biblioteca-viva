"""Render actual F2 source poses; not a physical-device visual approval.
blender -b -t 2 --python assets/3d/source/inhabitants/render-actions.py
"""
import bpy, os
from mathutils import Vector
base=os.getcwd();out=base+'/docs/evidence/bf4f2';os.makedirs(out,exist_ok=True)
for name in ['samael','aryn','ytha','lua']:
 bpy.ops.wm.open_mainfile(filepath=base+'/assets/3d/source/inhabitants/'+name+'.blend')
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=8;s.world.color=(.2,.2,.2)
 bpy.ops.object.camera_add(location=(2,-5,2.6));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.6;s.camera=cam
 for loc,power,size in [((1,-4,5),500,4),((-3,-1,2),300,3),((1,3,3),600,3)]:
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
 s.render.resolution_x=400;s.render.resolution_y=480;s.render.resolution_percentage=100
 for clip,frame in [('idle',1),('work',55),('magic',48)]:
  for o in s.objects:
   if o.animation_data:
    for track in o.animation_data.nla_tracks: track.mute=track.name!=clip
  s.frame_set(frame);s.render.filepath=out+'/'+name+'-'+clip+'.png';bpy.ops.render.render(write_still=True)
