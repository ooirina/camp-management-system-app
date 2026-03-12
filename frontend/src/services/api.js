import axios from 'axios'
const API_BASE_URL='http://localhost:8080';
const api=axios.create({
baseURL:API_BASE_URL,
headers:{'Content-Type':'application/json'
}
});

//servicii tabere

export const campService={
getAll:()=>api.get('/tabere/lista'),
getById:(id)=>api.get('/tabere/${id}'),
create: (tabara)=> api.post('/tabere/creare',tabara),
update:(id,updatedCamp)=>api.put('/tabere/actualizare/${id}',updatedCamp),
delete:(id)=>api.delete('/tabere/stergere/${id}')
};

//servicii activitate
export const ActivityService={
getAll:()=>api.get('/activitati/lista'),
getById:(id)=>api.get('/activitati/${id}'),
create: (activitate)=> api.post('/activitati/creare',activitate),
update:(id,updatedActivitate)=>api.put('/activitati/actualizare/${id}',updatedActivitate),
delete:(id)=>api.delete('/activitati/stergere/${id}')
};

//servicii inscriere
export const RegistrationService={
getAll:()=>api.get('/inscrieri/lista'),
getById:(id)=>api.get('/inscrieri/${id}'),
create: (inscriere)=> api.post('/inscrieri/creare',inscriere),
update:(id,updatedRegistration)=>api.put('/inscrieri/actualizare/${id}',updatedRegistration),
delete:(id)=>api.delete('/inscrieri/stergere/${id}')
};

//servicii participant
export const ParticipantService={
getAll:()=>api.get('/participanti/lista'),
getById:(id)=>api.get('/participanti/${id}'),
create: (participant)=> api.post('/participanti/creare',participant),
update:(id,updatedParticipant)=>api.put('/participanti/actualizare/${id}',updatedParticipant),
delete:(id)=>api.delete('/participanti/stergere/${id}')
};

//servicii prezenta perticipant
export const ParticipantPrezentaService={
getAll:()=>api.get('/participant_prezenta/lista'),
getById:(id)=>api.get('/participant_prezenta/${id}'),
create: (prezenta)=> api.post('/participant_prezenta/creare',prezenta),
update:(id,updatedAttendance)=>api.put('/participant_prezenta/actualizare/${id}',updatedAttendance),
delete:(id)=>api.delete('/participant_prezenta/stergere/${id}')
};

//servicii traseu
export const TraseuService={
getAll:()=>api.get('/trasee/lista'),
getById:(id)=>api.get('/trasee/${id}'),
create: (traseu)=> api.post('/trasee/creare',traseu),
update:(id,updatedTrail)=>api.put('/trasee/actualizare/${id}',updatedTrail),
delete:(id)=>api.delete('/trasee/stergere/${id}')
};

//servicii user
export const UserService={
getAll:()=>api.get('/utilizatori/lista'),
getById:(id)=>api.get('/utilizatori/${id}'),
create: (user)=> api.post('/utilizatori/creare', user),
update:(id,updatedUser)=>api.put('/utilizatori/actualizare/${id}',updatedUser),
delete:(id)=>api.delete('/utilizatori/stergere/${id}')
};
export default api;

