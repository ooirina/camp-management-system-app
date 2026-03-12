import React,{ useState, useEffect} from 'react';
import {UserService } from '../services/api';
import { Link } from 'react-router-dom';

const UserList=()=>{
  const [users, setUsers]= useState([]);
  const [loading, setLoading]=useState(true);
  const [error, setError]= useState(null);


  useEffect(()=>{
  const fetchUsers= async()=> {
      try{
         const response= await UserService.getAll();
         setUsers(response.data);
         setLoading(false);
      } catch(err){
      setError('Eroare la incarcarea userilor');
      setLoading(false);

  }};
  fetchUsers();
  },[]);

  const handleDelete= async(id)=>{
  if (window.confirm("Sigur vrei sa stergi acest user?"))
  {  try {
       await UserService.delete(id);
       setUsers(users.filter(user=>user.id!==id));

  } catch(err)
  {
  alert("Nu s-a putut sterge userul!");
  }
  }
  };

  if (loading)
  return <div classNsme="text-center mt-5 ">Se incarca userii</div>;

  return(
  <div className="container mt-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Lista useri</h2>
                  <Link to="/useri/new" className="btn btn-success">
                      Adaugă User Nou
                  </Link>
              </div>

              <table className="table table-hover shadow-sm">
                  <thead className="table-dark">
                      <tr>
                          <th>ID</th>
                          <th>Parola</th>
                          <th>id Rol</th>

                      </tr>
                  </thead>
                  <tbody>
                      {users.length === 0 ? (
                          <tr>
                              <td colSpan="3" className="text-center">Nu există tabere înregistrate.</td>
                          </tr>
                      ) : (
                          users.map(user => (
                              <tr key={user.id}>
                                  <td>{user.id}</td>
                                  <td>{user.email}</td>
                                  <td>{user.parola}</td>
                                  <td>{user.idRol}</td>
                                  <td>
                                      <Link to={`/utilizatori/${user.id}`} className="btn btn-sm btn-info me-2">Detalii</Link>
                                      <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-danger">Șterge</button>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      );
  };


  export default UserList;




