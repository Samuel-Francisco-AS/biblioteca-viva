import bpy, math, os
from mathutils import Vector
base=os.getcwd()
for name in ['samael','aryn','ytha','lua']:
 bpy.ops.wm.open_mainfile(filepath=base+'/assets/3d/source/inhabitants/'+name+'.blend')
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16
 s.world.color=(.2,.2,.2)
 bpy.ops.object.camera_add(location=(2,-5,2.6));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.6;s.camera=cam
 for loc,power,size in [((1,-4,5),500,4),((-3,-1,2),300,3),((1,3,3),600,3)]:
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
 s.render.resolution_x=600;s.render.resolution_y=700;s.render.resolution_percentage=100;s.render.filepath=base+'/assets/3d/source/inhabitants/'+name+'.png';bpy.ops.render.render(write_still=True)
