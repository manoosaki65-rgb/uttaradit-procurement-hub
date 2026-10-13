import {test} from 'node:test';
import assert from 'node:assert/strict';
import {photoPage,preservePhotoPages,storedPageCount,documentPageCount} from '../lib/posting-photo-pages.js';
test('removing or replacing an earlier photo retains page assignments and original notes',()=>{
 const row={notes:'หมายเหตุเดิม',photos:[{id:'a',name:'old.jpg'},{id:'b',name:'other.jpg'}]};
 const notes=preservePhotoPages(row);
 assert.equal(photoPage(row.photos[1],0,notes),2);
 assert.ok(notes.startsWith('หมายเหตุเดิม\n'));
 assert.equal(photoPage({id:'c',name:'หน้า-1__new.jpg'},1,notes),1);
 assert.equal(preservePhotoPages({...row,notes}).split('[posting-photo-pages:').length,2);
 assert.equal(storedPageCount(preservePhotoPages(row,8)),8);
 assert.equal(storedPageCount(preservePhotoPages({...row,notes:preservePhotoPages(row,8)})),8);
});
test('page assignment survives reload and rejects malformed page numbers',()=>{
 assert.equal(photoPage({name:'หน้า-7__photo.png'},0),7);
 assert.equal(photoPage({name:'หน้า-9999__photo.png'},0),1);
 assert.equal(photoPage({id:'x',name:'photo.png'},2,'\n[posting-photo-pages:bad]'),3);
 assert.equal(documentPageCount({pdf:{name:'plan__page-7-9__batch-id__.pdf'},notes:''}),3);
});
