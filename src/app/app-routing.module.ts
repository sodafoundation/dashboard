import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', loadChildren: './business/home/home.module#HomeModule'},
    {path: 'block', loadChildren: './business/block/block.module#BlockModule'},
    {path: 'createVolume', loadChildren: './business/block/create-volume/create-volume.module#CreateVolumeModule'},
    {path: 'volumeDetails/:volumeId', loadChildren: './business/block/volume-detail/volume-detail.module#VolumeDetailModule'},
    {path: 'cloud', loadChildren: './business/cloud/cloud.module#CloudModule'},
    {path: 'profile', loadChildren: './business/profile/profile.module#ProfileModule'},
    {path: 'createProfile', loadChildren: './business/profile/createProfile/createProfile.module#CreateProfileModule'},
    {path: 'modifyProfile/:profileId', loadChildren: './business/profile/modifyProfile/modifyProfile.module#ModifyProfileModule'},
    {path: 'resource', loadChildren: './business/resource/resource.module#ResourceModule'},
    {path: 'identity', loadChildren: './business/identity/identity.module#IdentityModule'},
    {path: 'volumeGroupDetails/:groupId', loadChildren: './business/block/volume-group-detail/volume-group-detail.module#VolumeGroupDetailModule'},
    {path: 'block/:fromRoute', loadChildren: './business/block/block.module#BlockModule'},
    {path: 'dataflow', loadChildren: './business/dataflow/dataflow.module#DataflowModule'},
    {path: 'bucketDetail/:bucketId', loadChildren: './business/block/bucket-detail/bucket-detail.module#BucketDetailModule'},
    {path: 'akSkManagement', loadChildren: './business/ak-sk/ak-sk.module#AkSkModule'},
    {path: 'monitor', loadChildren: './business/monitor/monitor.module#MonitorModule'},
    {path: 'createFileShare', loadChildren: './business/block/create-file-share/create-file-share.module#CreateFileShareModule'},
    {path: 'fileShareDetail/:fileShareId', loadChildren: './business/block/file-share-detail/file-share-detail.module#FileShareDetailModule'},
    {path: 'services', loadChildren: './business/services/services.module#ServicesModule'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
