import React, {useEffect, useState} from 'react';
import {Nav,Navbar,NavDropdown,Container,Table, Form, InputGroup} from 'react-bootstrap';
import {useTable} from 'react-table';
import {BrowserRouter as Router, Routes,Route,useNavigate,Link} from 'react-router-dom';
import {About,Contact} from '../Info/Info';
import { Register,LogIn,LogOut } from '../User/User';
import {CheckIn,CheckOut,Add,Delete} from '../Update/Update';
import { getAllItems, getUsageActivity, getAdminActivity, getMyItems, getRoom } from '../../DB/DB';
import logo from '../images/logo.png';
import './Activity.css';
import Cookies from 'js-cookie';

export const AllUsageActivity = () => {
    const [search, setSearch] = useState('');
    const [usageID_search, setUsageIdSearch] = useState('');
    const [itemID_search, setItemIdSearch] = useState('');
    const [itemType_search, setItemTypeSearch] = useState('');
    const [userName_search, setUserNameSearch] = useState('');
    const [roomName_search, setRoomNameSearch] = useState('');
    const [timeIn_search, setTimeInSearch] = useState('');
    const [timeOut_search, setTimeOutSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "UsageID", dir: "DSC"});
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([])
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
      if(Cookies.get("User") === undefined) {
        navigate("/login");
        window.location.reload();
      }
    }, []);

    useEffect(() => {
      if(page > Math.ceil(finalRows.length / 10)) {
        if(page >= 2) {
          setPage(page - 1);
        } else {
          setPage(1);
        }
      }
    }, [finalRows]);
  
    useEffect(() => {
      getUsageActivity()
      .then(usage => {
        usage = JSON.parse(usage);
        setRows(usage.usageActivity);
      })
    },[finalRows]);
    
    useEffect(() => {
      getFinalRows();
    },[rows, sort, search, usageID_search, itemID_search,
      itemType_search, userName_search, roomName_search, 
      timeIn_search, timeOut_search]);
  
      function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
          })
      }
  
      function sortItems(usageList) {
        if (sort.dir === 'ASC') {
          if(sort.sortKey === "UsageID" || sort.sortKey === "ItemID") {
            return usageList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
          }
          return usageList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
          );
        }
        else {
          if(sort.sortKey === "UsageID" || sort.sortKey === "ItemID") {
            return usageList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
          }
          return usageList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
          );
        }
      }

      function getFinalRows() {
        var filteredRows = rows.filter((usage) => {
          return (
            ((usageID_search.toLowerCase().trim() === '' ? usage.UsageID.toLowerCase().includes(usageID_search.toLowerCase().trim()) : usage.UsageID.toLowerCase() === (usageID_search.toLowerCase().trim()))
            && (itemID_search.toLowerCase().trim() === '' ? usage.ItemID.toLowerCase().includes(itemID_search.toLowerCase().trim()) : usage.ItemID.toLowerCase() === (itemID_search.toLowerCase().trim()))
            && usage.ItemType.toLowerCase().includes(itemType_search.toLowerCase().trim())
            && usage.RoomName.toLowerCase().includes(roomName_search.toLowerCase().trim())
            && usage.UserName.toLowerCase().includes(userName_search.toLowerCase().trim())
            && usage.TimeIn.toLowerCase().includes(timeIn_search.toLowerCase().trim())
            && usage.TimeOut.toLowerCase().includes(timeOut_search.toLowerCase().trim()))
            && ((search.toLowerCase().trim() === '' ? usage.UsageID.toLowerCase().includes(search.toLowerCase().trim()) : usage.UsageID.toLowerCase() === (search.toLowerCase().trim()))
            || (search.toLowerCase().trim() === '' ? usage.ItemID.toLowerCase().includes(search.toLowerCase().trim()) : usage.ItemID.toLowerCase() === (search.toLowerCase().trim()))
            || usage.ItemType.toLowerCase().includes(search.toLowerCase().trim())
            || usage.RoomName.toLowerCase().includes(search.toLowerCase().trim())
            || usage.UserName.toLowerCase().includes(search.toLowerCase().trim())
            || usage.TimeIn.toLowerCase().includes(search.toLowerCase().trim())
            || usage.TimeOut.toLowerCase().includes(search.toLowerCase().trim()))
          )
        });
  
        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
      }
  
      return (
        <Container>
        <h1 className='text-center mt-4' style={{marginTop: 'auto'}}>All Usage Activity</h1>
        <Form>
          <InputGroup className='my-3'>
            <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
          </InputGroup>
        </Form>
        <Table striped bordered hover className="itemTable">
        <thead>
          <tr>
            <th className="usageID">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setUsageIdSearch(e.target.value)} placeholder='Search by Usage ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("UsageID")}>Usage ID</div>
            </th>
            <th className="itemID">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setItemIdSearch(e.target.value)} placeholder='Search by Item ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ItemID")}>Item ID</div>
            </th>
            <th className="itemType">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setItemTypeSearch(e.target.value)} placeholder='Search by Item Type'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ItemType")}>Item Type</div>
            </th>
            <th className="itemType">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setUserNameSearch(e.target.value)} placeholder='Search by User'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("UserName")}>User</div>
            </th>
            <th className="room">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setRoomNameSearch(e.target.value)} placeholder='Search by Room'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("RoomName")} className="room">Room</div>
            </th>
            <th className="timeIn">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setTimeInSearch(e.target.value)} placeholder='Search by Time In'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("TimeIn")}>Time In</div>
            </th>
            <th className="timeOut">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setTimeOutSearch(e.target.value)} placeholder='Search by Time Out'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("TimeOut")}>Time Out</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10).map((row, i) => (
            <tr key={row.UsageID}>
              <td>{row.UsageID}</td>
              <td>{row.ItemID}</td>
              <td>{row.ItemType}</td>
              <td>{row.UserName}</td>
              <td>{row.RoomName}</td>
              <td>{row.TimeIn}</td>
              <td>{row.TimeOut}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="pageButtons">
      <button className="prevButton"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="pageNum">{page}</span>
      <button className = "nextButton"
        onClick={() => setPage(page + 1)}
        disabled={page >= Math.ceil(finalRows.length / 10)}
      >
        Next
      </button>
      </div>     
      </Container>
      )
  }

  export const MyUsageActivity = () => {
    const [search, setSearch] = useState('');
    const [usageID_search, setUsageIdSearch] = useState('');
    const [itemID_search, setItemIdSearch] = useState('');
    const [itemType_search, setItemTypeSearch] = useState('');
    const [roomName_search, setRoomNameSearch] = useState('');
    const [timeIn_search, setTimeInSearch] = useState('');
    const [timeOut_search, setTimeOutSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "UsageID", dir: "DSC"});
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([])
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
      if(Cookies.get("User") === undefined) {
        navigate("/login");
        window.location.reload();
      }
    }, []);

    useEffect(() => {
      if(page > Math.ceil(finalRows.length / 10)) {
        if(page >= 2) {
          setPage(page - 1);
        } else {
          setPage(1);
        }
      }
    }, [finalRows]);

      useEffect(() => {
        var userID = JSON.parse(Cookies.get("User")).UserID;
        getUsageActivity()
        .then(usage => {
          usage = JSON.parse(usage).usageActivity;
          setRows(usage.filter(use => {
            return use.UserID === userID
          }))
        });
      },[finalRows]);

        useEffect(() => {
          getFinalRows();
        },[rows, sort, search, usageID_search, itemID_search,
          itemType_search, roomName_search, timeIn_search, timeOut_search]);
  
      function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
          })
      }
  
      function sortItems(usageList) {
        if (sort.dir === 'ASC') {
          if(sort.sortKey === "UsageID" || sort.sortKey === "ItemID") {
            return usageList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
          }
          return usageList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
          );
        }
        else {
          if(sort.sortKey === "UsageID" || sort.sortKey === "ItemID") {
            return usageList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
          }
          return usageList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
          );
        }
      }
  
      function getFinalRows() {
        var filteredRows = rows.filter((usage) => {
          return (
            ((usageID_search.toLowerCase().trim() === '' ? usage.UsageID.toLowerCase().includes(usageID_search.toLowerCase().trim()) : usage.UsageID.toLowerCase() === (usageID_search.toLowerCase().trim()))
            && (itemID_search.toLowerCase().trim() === '' ? usage.ItemID.toLowerCase().includes(itemID_search.toLowerCase().trim()) : usage.ItemID.toLowerCase() === (itemID_search.toLowerCase().trim()))
            && usage.ItemType.toLowerCase().includes(itemType_search.toLowerCase().trim())
            && usage.RoomName.toLowerCase().includes(roomName_search.toLowerCase().trim())
            && usage.TimeIn.toLowerCase().includes(timeIn_search.toLowerCase().trim())
            && usage.TimeOut.toLowerCase().includes(timeOut_search.toLowerCase().trim()))
            && ((search.toLowerCase().trim() === '' ? usage.UsageID.toLowerCase().includes(search.toLowerCase().trim()) : usage.UsageID.toLowerCase() === (search.toLowerCase().trim()))
            || (search.toLowerCase().trim() === '' ? usage.ItemID.toLowerCase().includes(search.toLowerCase().trim()) : usage.ItemID.toLowerCase() === (search.toLowerCase().trim()))
            || usage.ItemType.toLowerCase().includes(search.toLowerCase().trim())
            || usage.RoomName.toLowerCase().includes(search.toLowerCase().trim())
            || usage.TimeIn.toLowerCase().includes(search.toLowerCase().trim())
            || usage.TimeOut.toLowerCase().includes(search.toLowerCase().trim()))
          )
        });
  
        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
      }
    
      return (
        <Container>
        <h1 className='text-center mt-4' style={{marginTop: 'auto'}}>My Usage Activity</h1>
        <Form>
          <InputGroup className='my-3'>
            <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
          </InputGroup>
        </Form>
        <Table striped bordered hover className="itemTable">
        <thead>
          <tr>
            <th className="usageID">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setUsageIdSearch(e.target.value)} placeholder='Search by Usage ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("UsageID")}>Usage ID</div>
            </th>
            <th className="itemID">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setItemIdSearch(e.target.value)} placeholder='Search by Item ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ItemID")}>Item ID</div>
            </th>
            <th className="itemType">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setItemTypeSearch(e.target.value)} placeholder='Search by Item Type'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ItemType")}>Item Type</div>
            </th>
            <th className="room">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setRoomNameSearch(e.target.value)} placeholder='Search by Room'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("RoomName")} className="room">Room</div>
            </th>
            <th className="timeIn">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setTimeInSearch(e.target.value)} placeholder='Search by Time In'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("TimeIn")}>Time In</div>
            </th>
            <th className="timeOut">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setTimeOutSearch(e.target.value)} placeholder='Search by Time Out'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("TimeOut")}>Time Out</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10)
          .map((row, i) => (
            <tr key={row.UsageID}>
              <td>{row.UsageID}</td>
              <td>{row.ItemID}</td>
              <td>{row.ItemType}</td>
              <td>{row.RoomName}</td>
              <td>{row.TimeIn}</td>
              <td>{row.TimeOut}</td>
            </tr>
          ))}
        </tbody>
      </Table>  
      <div className="pageButtons">
        <button className="prevButton"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="pageNum">{page}</span>
        <button className = "nextButton"
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(finalRows.length / 10)}
        >
          Next
        </button>
      </div>   
      </Container>
      )
  }

  export const AllAdminActivity = () => {
    const [search, setSearch] = useState('');
    const [actionID_search, setActionIdSearch] = useState('');
    const [adminID_search, setAdminIdSearch] = useState('');
    const [adminName_search, setAdminNameSearch] = useState('');
    const [operation_search, setOperationSearch] = useState('');
    const [objectType_search, setObjectTypeSearch] = useState('');
    const [objectID_search, setObjectIdSearch] = useState('');
    const [objectName_search, setObjectNameSearch] = useState('');
    const [time_search, setTimeSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "ActionID", dir: "DSC"});
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([]);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
  
    useEffect(() => {
      getAdminActivity()
        .then(actions => {
          actions = JSON.parse(actions);
          setRows(actions.adminActivity);
        });
    }); 

    useEffect(() => {
      if(Cookies.get("User") === undefined) {
        navigate("/login");
        window.location.reload();
      }
      else if(JSON.parse(Cookies.get("User")).Admin === "0") {
        navigate("/");
        window.location.reload();
      }
    }, []);

    useEffect(() => {
      if(page > Math.ceil(finalRows.length / 10)) {
        if(page >= 2) {
          setPage(page - 1);
        } else {
          setPage(1);
        }
      }
    }, [finalRows]);

      useEffect(() => {
        getFinalRows();
      },[rows, sort, search, actionID_search, adminID_search, 
        adminName_search, operation_search, objectType_search, objectID_search,
        objectName_search, time_search]);
  
      function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
          })
      }
  
      function sortItems(actionList) {
        if (sort.dir === 'ASC') {
          if(sort.sortKey === "ActionID" || sort.sortKey === "ObjectID" || sort.sortKey === "AdminID") {
            return actionList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
          }
          return actionList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
          );
        }
        else {
          if(sort.sortKey === "ActionID" || sort.sortKey === "ObjectID" || sort.sortKey === "AdminID") {
            return actionList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
          }
          return actionList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
          );
        }
      }
  
      function getFinalRows() {
        var filteredRows = rows.filter((action) => {
          return (
            ((actionID_search.toLowerCase().trim() === '' ? action.ActionID.toLowerCase().includes(actionID_search.toLowerCase().trim()) : action.ActionID.toLowerCase() === (actionID_search.toLowerCase().trim()))
            && (adminID_search.toLowerCase().trim() === '' ? action.AdminID.toLowerCase().includes(adminID_search.toLowerCase().trim()) : action.AdminID.toLowerCase() === (adminID_search.toLowerCase().trim()))
            && action.AdminName.toLowerCase().includes(adminName_search.toLowerCase().trim())
            && action.Operation.toLowerCase().includes(operation_search.toLowerCase().trim())
            && action.ObjectType.toLowerCase().includes(objectType_search.toLowerCase().trim())
            && action.ObjectID.toLowerCase().includes(objectID_search.toLowerCase().trim())
            && action.ObjectName.toLowerCase().includes(objectName_search.toLowerCase().trim())
            && action.Time.toLowerCase().includes(time_search.toLowerCase().trim()))
            && ((search.toLowerCase().trim() === '' ? action.ActionID.toLowerCase().includes(search.toLowerCase().trim()) : action.ActionID.toLowerCase() === (search.toLowerCase().trim()))
            || (search.toLowerCase().trim() === '' ? action.AdminID.toLowerCase().includes(search.toLowerCase().trim()) : action.AdminID.toLowerCase() === (search.toLowerCase().trim()))
            || action.AdminName.toLowerCase().includes(search.toLowerCase().trim())
            || action.Operation.toLowerCase().includes(search.toLowerCase().trim())
            || action.ObjectType.toLowerCase().includes(search.toLowerCase().trim())
            || action.ObjectID.toLowerCase().includes(search.toLowerCase().trim())
            || action.ObjectName.toLowerCase().includes(search.toLowerCase().trim())
            || action.Time.toLowerCase().includes(search.toLowerCase().trim()))
          )
        });

        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
      }

      return (
        <Container>
        <h1 className='text-center mt-4' style={{marginTop: 'auto'}}>All Admin Activity</h1>
        <Form>
          <InputGroup className='my-3'>
            <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
          </InputGroup>
        </Form>
        <Table striped bordered hover className="itemTable">
        <thead>
          <tr>
            <th className="actionID">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setActionIdSearch(e.target.value)} placeholder='Search by Action ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ActionID")}>Action ID</div>
            </th>
            <th className="itemID">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setAdminIdSearch(e.target.value)} placeholder='Search by Admin ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("AdminID")}>Admin ID</div>
            </th>
            <th className="itemType">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setAdminNameSearch(e.target.value)} placeholder='Search by Admin Name'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("AdminName")}>Admin Name</div>
            </th>
            <th className="itemType">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setOperationSearch(e.target.value)} placeholder='Search by Operation'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("Operation")}>Operation</div>
            </th>
            <th className="room">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setObjectTypeSearch(e.target.value)} placeholder='Search by Object Type'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ObjectType")} className="room">Object Type</div>
            </th>
            <th className="timeIn">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setObjectIdSearch(e.target.value)} placeholder='Search by Object ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ObjectID")}>Object ID</div>
            </th>
            <th className="timeIn">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setObjectNameSearch(e.target.value)} placeholder='Search by Object Name'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ObjectName")}>Object Name</div>
            </th>
            <th className="timeOut">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setTimeSearch(e.target.value)} placeholder='Search by Time'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("Time")}>Time</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10)
          .map((row, i) => (
            <tr key={row.ActionID}>
              <td>{row.ActionID}</td>
              <td>{row.AdminID}</td>
              <td>{row.AdminName}</td>
              <td>{row.Operation}</td>
              <td>{row.ObjectType}</td>
              <td>{row.ObjectID}</td>
              <td>{row.ObjectName}</td>
              <td>{row.Time}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="pageButtons">
      <button className="prevButton"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="pageNum">{page}</span>
      <button className = "nextButton"
        onClick={() => setPage(page + 1)}
        disabled={page >= Math.ceil(finalRows.length / 10)}
      >
        Next
      </button>
      </div>     
      </Container>
      )
  }

  export const MyAdminActivity = () => {
    const [search, setSearch] = useState('');
    const [actionID_search, setActionIdSearch] = useState('');
    const [operation_search, setOperationSearch] = useState('');
    const [objectType_search, setObjectTypeSearch] = useState('');
    const [objectID_search, setObjectIdSearch] = useState('');
    const [objectName_search, setObjectNameSearch] = useState('');
    const [time_search, setTimeSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "ActionID", dir: "DSC"});
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([]);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
  
    useEffect(() => {
      if(Cookies.get("User") === undefined) {
        navigate("/login");
        window.location.reload();
      }
      else if(JSON.parse(Cookies.get("User")).Admin === "0") {
        navigate("/");
        window.location.reload();
      }
    }, []);

    useEffect(() => {
      var userID = JSON.parse(Cookies.get("User")).UserID;
      getAdminActivity()
      .then(actions => {
        actions = JSON.parse(actions).adminActivity;
        setRows(actions.filter(action => {
          return action.AdminID === userID;
        }));
      });
    });

    useEffect(() => {
      if(page > Math.ceil(finalRows.length / 10)) {
        if(page >= 2) {
          setPage(page - 1);
        } else {
          setPage(1);
        }
      }
    }, [finalRows]);

      useEffect(() => {
        getFinalRows();
      },[rows, sort, search, actionID_search, operation_search, objectType_search, objectID_search,
        objectName_search, time_search]);

      function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
          })
      }
  
      function sortItems(actionList) {
        if (sort.dir === 'ASC') {
          if(sort.sortKey === "ActionID" || sort.sortKey === "ObjectID" || sort.sortKey === "AdminID") {
            return actionList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
          }
          return actionList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
          );
        }
        else {
          if(sort.sortKey === "ActionID" || sort.sortKey === "ObjectID" || sort.sortKey === "AdminID") {
            return actionList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
          }
          return actionList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
          );
        }
      }
  
      function getFinalRows() {
        var filteredRows = rows.filter((action) => {
          return (
            ((actionID_search.toLowerCase().trim() === '' ? action.ActionID.toLowerCase().includes(actionID_search.toLowerCase().trim()) : action.ActionID.toLowerCase() === (actionID_search.toLowerCase().trim()))
            && action.Operation.toLowerCase().includes(operation_search.toLowerCase().trim())
            && action.ObjectType.toLowerCase().includes(objectType_search.toLowerCase().trim())
            && action.ObjectID.toLowerCase().includes(objectID_search.toLowerCase().trim())
            && action.ObjectName.toLowerCase().includes(objectName_search.toLowerCase().trim())
            && action.Time.toLowerCase().includes(time_search.toLowerCase().trim()))
            && ((search.toLowerCase().trim() === '' ? action.ActionID.toLowerCase().includes(search.toLowerCase().trim()) : action.ActionID.toLowerCase() === (search.toLowerCase().trim()))              
            || action.Operation.toLowerCase().includes(search.toLowerCase().trim())
            || action.ObjectType.toLowerCase().includes(search.toLowerCase().trim())
            || action.ObjectID.toLowerCase().includes(search.toLowerCase().trim())
            || action.ObjectName.toLowerCase().includes(search.toLowerCase().trim())
            || action.Time.toLowerCase().includes(search.toLowerCase().trim()))
          )
        });
  
        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
      }
      
      return (
        <Container>
        <h1 className='text-center mt-4' style={{marginTop: 'auto'}}>My Admin Activity</h1>
        <Form>
          <InputGroup className='my-3'>
            <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
          </InputGroup>
        </Form>
        <Table striped bordered hover className="itemTable">
        <thead>
          <tr>
            <th className="actionID">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setActionIdSearch(e.target.value)} placeholder='Search by Action ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ActionID")}>Action ID</div>
            </th>
            <th className="itemType">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setOperationSearch(e.target.value)} placeholder='Search by Operation'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("Operation")}>Operation</div>
            </th>
            <th className="room">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setObjectTypeSearch(e.target.value)} placeholder='Search by Object Type'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ObjectType")} className="room">Object Type</div>
            </th>
            <th className="timeIn">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setObjectIdSearch(e.target.value)} placeholder='Search by Object ID'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ObjectID")}>Object ID</div>
            </th>
            <th className="timeIn">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setObjectNameSearch(e.target.value)} placeholder='Search by Object Name'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("ObjectName")}>Object Name</div>
            </th>
            <th className="timeOut">
              <Form>
                <InputGroup className='my-3'>
                  <Form.Control onChange={(e) => setTimeSearch(e.target.value)} placeholder='Search by Time'/>
                </InputGroup>
              </Form>
              <div onClick={() => chooseSort("Time")}>Time</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10)
          .map((row, i) => (
            <tr key={row.ActionID}>
              <td>{row.ActionID}</td>
              <td>{row.Operation}</td>
              <td>{row.ObjectType}</td>
              <td>{row.ObjectID}</td>
              <td>{row.ObjectName}</td>
              <td>{row.Time}</td>
            </tr>
          ))}
        </tbody>
      </Table> 
      <div className="pageButtons">
      <button className="prevButton"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="pageNum">{page}</span>
      <button className = "nextButton"
        onClick={() => setPage(page + 1)}
        disabled={page >= Math.ceil(finalRows.length / 10)}
      >
        Next
      </button>
    </div>    
      </Container>
      )
  }