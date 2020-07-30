import { ReviewComponent } from './review/review.component';
import { UploadComponent } from './upload/upload.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// const routes: Routes = [];
const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'review', component: ReviewComponent },
  // { path: 'worksheets', component: WorksheetsComponent, canActivate: [AuthGuard], pathMatch: 'prefix'},
  // { path: 'detail', component: ViewWorksheetComponent, canActivate: [AuthGuard] },
  // { path: 'analysis', component: ViewAnalysisComponent, canActivate: [AuthGuard] },
  // { path: 'review', component: ViewReviewComponent, canActivate: [AuthGuard] },
  // // { path: 'upload', component: UploadDocumentComponent, canActivate: [AuthGuard] },
  // { path: '**', redirectTo: 'worksheets' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
