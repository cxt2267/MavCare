import React, {useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route,Link,Navigate, useNavigate} from 'react-router-dom';
import {Container, Table, Form, InputGroup} from 'react-bootstrap';
import {getAllItems, getScannedItems, getUsers, addItems, addUsers, deleteUsers, undeleteUser, unaddUser, makeAdmin, deleteItems, undeleteItem, getEpcs, getRooms, getRoom, checkIn, checkOut, setClean, getItemTypes, addRooms, deleteRooms, undeleteRoom} from '../../DB/DB';
import './AddDelete.css';
import Cookies from 'js-cookie';

export const AddItem = () => {
    const [rows, setRows] = useState([]);
    const [all_epcs, setAllEpcs] = useState([]);
    const [item_types, setItemTypes] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [item_type_list, setItemTypeList] = useState([]);
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [Added, setAdded] = useState(false);
    const [removedEpcs, setRemovedEpcs] = useState([]);
    const [admin, setAdmin] = useState('');
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
        setAdmin(JSON.parse(Cookies.get("User")).UserID);
        if(!roomScanned) {
            getRoomSelections();
        } else {
            setRoom(localStorage.getItem("Room"));
        }
        getItemTypeList();
        if(stopScan !== true) {
            getEpcs()
            .then(epcs => {
                epcs = JSON.parse(epcs);
                epcs = epcs.EPC;
                let tuples = [];
                for(let i = 0; i < epcs.length; i++) {
                    tuples.push(epcs[i]);
                } 
                all_epcs.push(tuples);
            })
            .then(() => getRows());
        }
    },[navigate, rows, stopScan, all_epcs, removedEpcs]);

    function getRows() {
        var epcs = [];
        for(let i=0; i<all_epcs.length; i++) {
            for(let j=0; j<all_epcs[i].length; j++) {
                if(!removedEpcs.includes(all_epcs[i][j])) {
                    epcs.push(all_epcs[i][j]);
                }
            }
        }
        epcs = epcs.filter((epc, ind, self) => 
            ind === self.findIndex((tupple) => (
                tupple === epc
            ))
        );
        setRows(epcs);
    }

    function getRoomSelections() {
        getRooms().then((roomList) => {
            roomList = JSON.parse(roomList);
            roomList = roomList.Rooms;
            setRooms(roomList);
        })
    }

    function getItemTypeList() {
        getItemTypes().then((itemTypeList) => {
            itemTypeList = JSON.parse(itemTypeList);
            itemTypeList = itemTypeList.ItemTypes;
            setItemTypeList(itemTypeList);
        })
    }

    const saveRoom = (event) => {
        setRoom(event.target.value);
    }

    function addScannedItems() {
        setStopScan(true)
        if(room === null || room === undefined) {
            setResult(`Please select room first.`);
            setStopScan(false);
            return;
        }
        
        var roomID = JSON.parse(room).RoomID;
        var epcs = rows;
        var items = [];
        for(let i=0; i<rows.length; i++) {
            const json = {
                "EPC": rows[i],
                "ItemType": item_types[i]
            }
            items.push(JSON.stringify(json));
        }
        addItems(items, roomID, admin).then(resp => {       
           setResult("Items successfully added!");     
           setAdded(true);
        })
    }
    
    const itemTypeChange = (event, i) => {
        const type_inputs = [...item_types];
        type_inputs[i] = (event.target.value).trim();
        setItemTypes(type_inputs);
    }

    function removeEpc(epc) {
        var new_epcs = []
        for(let i=0; i<all_epcs.length; i++) {
            const arr = all_epcs[i].filter(tag => tag !== epc);
            new_epcs.push(arr)
        }
        setAllEpcs(new_epcs)
        removedEpcs.push(epc);
        if(stopScan === true) {
            getRows();
        }
        setRemovedEpcs([]);
    }

    const totalPages = Math.ceil(rows.length / 10);
    const currRows = [...rows].reverse().slice((page - 1) * 10, (page - 1) * 10 + 10);

    return (
        <Container>
            {!Added && <h3 className="scanItems">Scan Items to be Added (one at a time)</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="epc">EPC</th>
                    <th className="itemType">Item Type</th>
                    {!Added && <th className="remove">Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {currRows.map((row, i) => (
                    <tr key={i} className="tuple">
                        <td>{row}</td>
                        <td>
                            <select value={item_types[i]} onChange={(e) => itemTypeChange(e, i)} style={{ marginRight: '20px' }}>
                                <option>Select Item Type</option>
                                {item_type_list.map((type, j) => (
                                    <option key={j} value={type}>{type}</option>
                                ))}
                            </select>
                            <span style={{marginRight: "17px"}}>or</span>
                            <input type="text" placeholder="Enter Item Type" onChange={(e) => itemTypeChange(e, i)}/>
                            {false && 
                            <div>
                            <input
                                type="text"
                                placeholder="Item Type"
                                value={item_types[i]}
                                onChange={(e) => itemTypeChange(e, i)}
                                list="type_options"
                            />
                            <datalist id="type_options">
                                {item_type_list.map((type, j) => (
                                    <option key={j} value={type}>{type}</option>
                                ))}
                            </datalist>
                            </div> }
                        </td>
                       {!Added && <td><button style={{border: 'groove', width:40, fontSize:17}} className="checkInButton" onClick={() => removeEpc(row)}>x</button></td>}
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
                disabled={page >= totalPages}
            >
                Next
            </button>
            </div>
            {!roomScanned && <div>
            <select onChange={saveRoom}>
                <option>Select Room</option>
                {rooms.map((room, i) => (
                    <option key={room.RoomID} value={JSON.stringify(room)}>{room.RoomName}</option>
                ))}
            </select>
            </div>}
            <br></br>
            <div>
            {!Added &&
            <button className="checkInButton" onClick={() => addScannedItems()}>
            Finish Adding Items</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const DeleteItemScan = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [undeleted, setUndeleted] = useState([]);
    const [removedItems, setRemovedItems] = useState([]);
    const [admin, setAdmin] = useState('');
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
        setAdmin(JSON.parse(Cookies.get("User")).UserID);
        if(stopScan !== true) {
            getScannedItems()
            .then(items => {
                items = JSON.parse(items);
                items = items.Items;
                let tuples = [];
                for(let i = 0; i < items.length; i++) {
                    tuples.push(JSON.parse(items[i]));
                } 
                all_items.push(tuples);
            })
            .then(() => getRows());
        }
    },[navigate, rows, stopScan, all_items, removedItems]);

    function getRows() {
        var items = [];
        for(let i=0; i<all_items.length; i++) {
            for(let j=0; j<all_items[i].length; j++) {
                if(!removedItems.includes(all_items[i][j].ItemID)) {
                    items.push(all_items[i][j]);
                }
            }
        }
        items = items.filter((item, ind, self) => 
            ind === self.findIndex((tupple) => (
                tupple.ItemID === item.ItemID
            ))
        );
        setRows(items);
    }


    function deleteScannedItems() {
        setStopScan(true)
        
        var itemIDs = rows.map((item) => {
            return item.ItemID;
        });
        deleteItems(itemIDs, admin).then(resp => {       
            setResult("Items successfully deleted!");     
            setDeleted(true);
        })
    }

    function undelete(itemID) {
        undeleteItem(itemID, admin).then(resp => {
            setResult(`Item ${itemID} undeleted successfully!`);
            undeleted[itemID] = true;
        })
    }

    function removeItem(id) {
        var new_items = []
        for(let i=0; i<all_items.length; i++) {
            const arr = all_items[i].filter(item => item.ItemID !== id);
            new_items.push(arr)
        }
        setAllItems(new_items)
        removedItems.push(id);
        if(stopScan === true) {
            getRows();
        }
        setRemovedItems([]);
    }

    const totalPages = Math.ceil(rows.length / 10);
    const currRows = [...rows].reverse().slice((page - 1) * 10, (page - 1) * 10 + 10);

    return (
        <Container>
            <h3 className="scanItems">{!deleted && <span>Scan Items to be Deleted</span>}
            <button className="scanInstead" onClick={() => {navigate("/delete-item-select");}}>
                Select Items Instead
            </button></h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    {!deleted && <th className="remove">Remove</th>}
                    {deleted && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                    {currRows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
                        {!deleted && <td><button style={{border: 'groove',width:40,fontSize:17}} className="checkInButton" onClick={() => removeItem(row.ItemID)}>x</button></td>}
                        {deleted && <td>{!undeleted[row.ItemID] && <button style={{border: 'groove'}} className="checkInButton" onClick={() => undelete(row.ItemID)}>undelete</button>}</td>}
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
                disabled={page >= totalPages}
            >
                Next
            </button>
            </div>
            <div>
            {!deleted &&
            <button className="checkInButton" onClick={() => deleteScannedItems()}>
            Finish Deleting Items</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const DeleteItemSelect = () => {
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([]);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState([]);
    const [admin, setAdmin] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [id_search, setIdSearch] = useState('');
    const [type_search, setTypeSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "ItemID", dir: "ASC"});
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
        setAdmin(JSON.parse(Cookies.get("User")).UserID);
        getAllItems().then(items => {
            items = JSON.parse(items).Items;
            setRows(items);
            for(let i = 0; i<items.length; i++) {
                deleted[items[i].ItemID] = false;
            }
        })
    },[]);

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
    },[rows, sort, search, id_search, type_search]);

    function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
          })
    }

    function sortItems(itemList) {
        if (sort.dir === 'ASC') {
          if(sort.sortKey === "ItemID") {
            return itemList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
          }
          return itemList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
          );
        }
        else {
          if(sort.sortKey === "ItemID") {
            return itemList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
          }
          return itemList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
          );
        }
    }

    function deleteSelectedItems() {
        if(selectedItems.length === 0) {
            setResult("Please select at least one item to delete.");
            return;
        }
        var itemIDs = selectedItems.map((item) => {
            return item.ItemID;
        });
        deleteItems(itemIDs, admin).then(resp => {       
            setResult("Items successfully deleted!");   
            for(let i=0; i<itemIDs.length; i++)  {
                deleted[itemIDs[i]] = true;
            }
        })
    }

    function undelete(item) {
        undeleteItem(item.ItemID, admin).then(resp => {
            setResult(`Item ${item.ItemID} successfully undeleted!`);
            deleted[item.ItemID] = false;
        })
    }

    const setItems = (event, item) => {
        const selected = event.target.checked;
        if (selected) {
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter(element => element !== item));
        }
        setResult("");
    }

    const someDeleted = () => {
        for(let i=0; i<rows.length; i++) {
            if(deleted[rows[i].ItemID]) {
                return true;
            }
        }
        return false;
    }

    function getFinalRows() {
        var filteredRows = rows.filter((item) => {
            return (
                ((id_search.toLowerCase().trim() === '' ? item.ItemID.toLowerCase().includes(id_search.toLowerCase().trim()) : item.ItemID.toLowerCase() === (id_search.toLowerCase().trim()))
                && item.ItemType.toLowerCase().includes(type_search.toLowerCase().trim()))
                && ((search.toLowerCase().trim() === '' ? item.ItemID.toLowerCase().includes(search.toLowerCase().trim()) : item.ItemID.toLowerCase() === (search.toLowerCase().trim())) 
                || item.ItemType.toLowerCase().includes(search.toLowerCase().trim()))
            )
            });
  
        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
    } 
    
    return (
        <Container>
            <h3 className="scanItems">Select Items to be Deleted 
            <button className="scanInstead" onClick={() => {navigate("/delete-item-scan");}}>
                Scan Items Instead
            </button></h3>
            <Form>
                <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
                </InputGroup>
            </Form>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                        <th className="roomID">
                            <Form>
                                <InputGroup className='my-3'>
                                    <Form.Control onChange={(e) => setIdSearch(e.target.value)} placeholder='Search by Item ID'/>
                                </InputGroup>
                            </Form>
                            <div onClick={() => chooseSort("ItemID")}>Item ID</div>
                        </th>
                        <th className="roomName">
                            <Form>
                                <InputGroup className='my-3'>
                                    <Form.Control onChange={(e) => setTypeSearch(e.target.value)} placeholder='Search by Item Type'/>
                                </InputGroup>
                            </Form>
                            <div onClick={() => chooseSort("ItemType")}>Item Type</div>
                        </th>
                        <th className="delete">Delete</th>
                    {someDeleted() && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                    {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10)
                    .map((row, i) => (
                            <tr key={row.ItemID} className="tuple">
                                <td>{row.ItemID}</td>
                                <td>{row.ItemType}</td>
                                <td><input type="checkbox" onChange={(e) => setItems(e, row)}/></td>
                                {someDeleted() && <td>{deleted[row.ItemID] && <button style={{border: 'groove'}} className="checkInButton" onClick={() => undelete(row) }>undelete</button>}</td>}
                            </tr>
                        ))
                    }
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
            <div>
            <button className="checkInButton" onClick={() => deleteSelectedItems()}>Delete Selected Items</button>
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const AddRoom = () => {
    const [rows, setRows] = useState([]);
    const [all_epcs, setAllEpcs] = useState([]);
    const [room_names, setRoomNames] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [Added, setAdded] = useState(false);
    const [removedEpcs, setRemovedEpcs] = useState([]);
    const [admin, setAdmin] = useState('');
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
        setAdmin(JSON.parse(Cookies.get("User")).UserID);
        if(stopScan !== true) {
            getEpcs()
            .then(epcs => {
                epcs = JSON.parse(epcs);
                epcs = epcs.EPC;
                let tuples = [];
                for(let i = 0; i < epcs.length; i++) {
                    tuples.push(epcs[i]);
                } 
                all_epcs.push(tuples);
            })
            .then(() => getRows());
        }
    },[navigate, rows, stopScan, all_epcs, removedEpcs, Added]);

    function getRows() {
        var epcs = [];
        for(let i=0; i<all_epcs.length; i++) {
            for(let j=0; j<all_epcs[i].length; j++) {
                if(!removedEpcs.includes(all_epcs[i][j])) {
                    epcs.push(all_epcs[i][j]);
                }
            }
        }
        epcs = epcs.filter((epc, ind, self) => 
            ind === self.findIndex((tupple) => (
                tupple === epc
            ))
        );
        setRows(epcs);
    }

    function addScannedRooms() {
        setStopScan(true)
        var epcs = rows;
        var rooms = [];
        for(let i=0; i<rows.length; i++) {
            const json = {
                "EPC": rows[i],
                "RoomName": room_names[i]
            }
            rooms.push(JSON.stringify(json));
        }
        addRooms(rooms, admin).then(resp => {       
           setResult("Rooms successfully added!");     
           setAdded(true);
        })
    }
    
    const roomNameChange = (event, i) => {
        const name_inputs = [...room_names];
        name_inputs[i] = (event.target.value).trim();
        setRoomNames(name_inputs);
    }

    function removeEpc(epc) {
        var new_epcs = []
        for(let i=0; i<all_epcs.length; i++) {
            const arr = all_epcs[i].filter(tag => tag !== epc);
            new_epcs.push(arr)
        }
        setAllEpcs(new_epcs)
        removedEpcs.push(epc);
        if(stopScan === true) {
            getRows();
        }
        setRemovedEpcs([]);
    }

    const totalPages = Math.ceil(rows.length / 10);
    const currRows = [...rows].reverse().slice((page - 1) * 10, (page - 1) * 10 + 10);

    return (
        <Container>
            {!Added && <h3 className="scanItems">Scan Room Tags (one at a time)</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="epc">EPC</th>
                    <th className="roomName">Room Name</th>
                    {!Added && <th className="remove">Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {currRows.map((row, i) => (
                    <tr key={i} className="tuple">
                        <td>{row}</td>
                        <td>
                            <input type="text" placeholder="Enter Room Name" onChange={(e) => roomNameChange(e, i)}/>
                        </td>
                       {!Added && <td><button style={{border: 'groove', width:40, fontSize:17}} className="checkInButton" onClick={() => removeEpc(row)}>x</button></td>}
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
                disabled={page >= totalPages}
            >
                Next
            </button>
            </div>
            <div>
            {!Added &&
            <button className="checkInButton" onClick={() => addScannedRooms()}>
            Finish Adding Rooms</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const DeleteRoom = () => {
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([]);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState([]);
    const [admin, setAdmin] = useState('');
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [id_search, setIdSearch] = useState('');
    const [name_search, setNameSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "RoomID", dir: "ASC"});
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
        setAdmin(JSON.parse(Cookies.get("User")).UserID);
        getRooms().then(rooms => {
            rooms = JSON.parse(rooms).Rooms;
            setRows(rooms);
            for(let i = 0; i<rooms.length; i++) {
                deleted[rooms[i].RoomID] = false;
            }
        })
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
    },[rows, sort, search, id_search, name_search]);

    function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
          })
    }

    function sortItems(itemList) {
        if (sort.dir === 'ASC') {
          if(sort.sortKey === "RoomID") {
            return itemList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
          }
          return itemList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
          );
        }
        else {
          if(sort.sortKey === "RoomID") {
            return itemList.sort((a,b) => 
              parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
          }
          return itemList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
          );
        }
    }

    function deleteSelectedRooms() {
        if(selectedRooms.length === 0) {
            setResult("Please select at least one room to delete.");
            return
        }
        var roomIDs = selectedRooms.map((room) => {
            return room.RoomID;
        });
        deleteRooms(roomIDs, admin).then(resp => {       
            setResult("Rooms successfully deleted!");   
            for(let i=0; i<roomIDs.length; i++)  {
                deleted[roomIDs[i]] = true;
            }
        })
    }

    function undelete(room) {
        undeleteRoom(room.RoomID, admin).then(resp => {
            setResult(`${room.RoomName} undeleted successfully!`);
            deleted[room.RoomID] = false;
        })
    }

    const setRooms = (event, room) => {
        const selected = event.target.checked;
        if (selected) {
            setSelectedRooms([...selectedRooms, room]);
        } else {
            setSelectedRooms(selectedRooms.filter(element => element !== room));
        }

        setResult("");
    }

    const someDeleted = () => {
        for(let i=0; i<rows.length; i++) {
            if(deleted[rows[i].RoomID]) {
                return true;
            }
        }
        return false;
    }

    function getFinalRows() {
        var filteredRows = rows.filter((room) => {
            return (
                ((id_search.toLowerCase().trim() === '' ? room.RoomID.toLowerCase().includes(id_search.toLowerCase().trim()) : room.RoomID.toLowerCase() === (id_search.toLowerCase().trim()))
                && room.RoomName.toLowerCase().includes(name_search.toLowerCase().trim()))
                && ((search.toLowerCase().trim() === '' ? room.RoomID.toLowerCase().includes(search.toLowerCase().trim()) : room.RoomID.toLowerCase() === (search.toLowerCase().trim())) 
                || room.RoomName.toLowerCase().includes(search.toLowerCase().trim()))
            )
        });
  
        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
    }

    return (
        <Container>
            <h3 className="scanItems">Select Rooms to be Deleted</h3>
            <Form>
                <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
                </InputGroup>
            </Form>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                        <th className="roomID">
                            <Form>
                                <InputGroup className='my-3'>
                                    <Form.Control onChange={(e) => setIdSearch(e.target.value)} placeholder='Search by Room ID'/>
                                </InputGroup>
                            </Form>
                            <div onClick={() => chooseSort("RoomID")}>Room ID</div>
                        </th>
                        <th className="roomName">
                            <Form>
                                <InputGroup className='my-3'>
                                    <Form.Control onChange={(e) => setNameSearch(e.target.value)} placeholder='Search by Room Name'/>
                                </InputGroup>
                            </Form>
                            <div onClick={() => chooseSort("RoomName")}>Room Name</div>
                        </th>
                        <th className="delete">Delete</th>
                    {someDeleted() && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                    {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10)
                    .map((row, i) => (
                            <tr key={row.RoomID} className="tuple">
                                <td>{row.RoomID}</td>
                                <td>{row.RoomName}</td>
                                <td><input type="checkbox" onChange={(e) => setRooms(e, row)}/></td>
                                {someDeleted() && <td>{deleted[row.RoomID] && <button style={{border: 'groove'}} className="checkInButton" onClick={() => undelete(row) }>undelete</button>}</td>}
                            </tr>
                        ))
                    }
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
            <div>
            <button className="checkInButton" onClick={() => deleteSelectedRooms()}>Delete Selected Rooms</button>
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const AddUser = () => {
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([]);
    const [result, setResult] = useState('');
    const [added, setAdded] = useState([]);
    const [admin, setAdmin] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedAdminUsers, setSelectedAdminUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [id_search, setIdSearch] = useState('');
    const [name_search, setNameSearch] = useState('');
    const [fname_search, setFnameSearch] = useState('');
    const [lname_search, setLnameSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "UserID", dir: "ASC"});
    const [addChecked, setAddChecked] = useState([]);
    const [adminChecked, setAdminChecked] = useState([]);
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
        setAdmin(JSON.parse(Cookies.get("User")).UserID);
        getUsers().then(users => {
            users = JSON.parse(users).Users;
            setRows(users.filter(user => {return user.Active === '2';}));
            for(let i = 0; i<users.length; i++) {
                added[users[i].UserID] = false;
                addChecked[users[i].UserID] = false;
                adminChecked[users[i].UserID] = false;
            }
        });
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
    },[rows, sort, search, id_search, name_search, fname_search, lname_search]);

    function addSelectedUsers() {
        if(selectedUsers.length === 0) {
            setResult("Please select at least one user to add.");
            return;
        }
        var userIDs = selectedUsers.map((user) => {
            return user.UserID;
        });
        var adminUserIDs = selectedUsers.map((user) => {
            if (selectedAdminUsers.includes(user)) {
                return user.UserID;
            }
        });
        addUsers(userIDs, admin).then(resp => {   
            makeAdmin(adminUserIDs, '1').then(resp => {
                setResult("Users successfully added!");   
                for(let i=0; i<userIDs.length; i++)  {
                   added[userIDs[i]] = true;
                }
            })   
        })
    }

    function unadd(user) {
        addChecked[user.UserID] = false;
        adminChecked[user.UserID] = false;
        setSelectedUsers(selectedUsers.filter(element => element !== user));
        setSelectedAdminUsers(selectedAdminUsers.filter(element => element !== user));
        unaddUser(user.UserID, admin, user.Admin).then(resp => {
            setResult(`User ${user.UserID} unadded successfully!`);
            added[user.UserID] = false;
        })
    }

    const setUsers = (event, user) => {
        const selected = event.target.checked;
        if (selected) {
            addChecked[user.UserID] = true;
            setSelectedUsers([...selectedUsers, user]);
        } else {
            addChecked[user.UserID] = false;
            adminChecked[user.UserID] = false;
            setSelectedUsers(selectedUsers.filter(element => element !== user));
            setSelectedAdminUsers(selectedAdminUsers.filter(element => element !== user));
        }
        setResult("");
    }

    const setAdminUsers = (event, user) => {
        const selected = event.target.checked;
        if (selected) {
            adminChecked[user.UserID] = true;
            setSelectedAdminUsers([...selectedAdminUsers, user]);
        } else {
            adminChecked[user.UserID] = false;
            setSelectedAdminUsers(selectedAdminUsers.filter(element => element !== user));
        }
        setResult("");
    }

    const someAdded = () => {
        for(let i=0; i<rows.length; i++) {
            if(added[rows[i].UserID]) {
                return true;
            }
        }
        return false;
    }

    function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
        })
    }
  
    function sortItems(itemList) {
        if (sort.dir === 'ASC') {
            if(sort.sortKey === "UserID") {
            return itemList.sort((a,b) => 
                parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
            }
            return itemList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
            );
        }
        else {
            if(sort.sortKey === "UserID") {
            return itemList.sort((a,b) => 
                parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
            }
            return itemList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
            );
        }
    }

    function getFinalRows() {
        var filteredRows = rows.filter((user) => {
            return (
                ((id_search.toLowerCase().trim() === '' ? user.UserID.toLowerCase().includes(id_search.toLowerCase().trim()) : user.UserID.toLowerCase() === (id_search.toLowerCase().trim()))
                && user.Username.toLowerCase().includes(name_search.toLowerCase().trim())
                && user.Fname.toLowerCase().includes(fname_search.toLowerCase().trim())
                && user.Lname.toLowerCase().includes(lname_search.toLowerCase().trim()))
                && ((search.toLowerCase().trim() === '' ? user.UserID.toLowerCase().includes(search.toLowerCase().trim()) : user.UserID.toLowerCase() === (search.toLowerCase().trim())) 
                || user.Username.toLowerCase().includes(search.toLowerCase().trim())
                || user.Fname.toLowerCase().includes(search.toLowerCase().trim())
                || user.Lname.toLowerCase().includes(search.toLowerCase().trim()))
            )
        });
  
        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
    }
    
    return (
        <Container>
            <h3 className="scanItems">Select Users to be Added</h3>
            <Form>
                <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
                </InputGroup>
            </Form>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="userID">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setIdSearch(e.target.value)} placeholder='Search by User ID'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("UserID")}>User ID</div>
                    </th>
                    <th className="username">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setNameSearch(e.target.value)} placeholder='Search by Username'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("Username")}>Username</div>
                    </th>
                    <th className="fname">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setFnameSearch(e.target.value)} placeholder='Search by First Name'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("Fname")} className="fname">F. Name</div>
                    </th>
                    <th className="lname">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setLnameSearch(e.target.value)} placeholder='Search by Last Name'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("Lname")}>L. Name</div>
                    </th>
                    <th className="">Add</th>
                    {selectedUsers.length > 0 && <th className="admin">Make Admin</th>}
                    {someAdded() && <th className="undelete">Unadd</th>}
                    </tr>
                </thead>
                <tbody>
                {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10)
                .map((row, i) => (
                        <tr key={row.UserID} className="tuple">
                            <td>{row.UserID}</td>
                            <td>{row.Username}</td>
                            <td>{row.Fname}</td>
                            <td>{row.Lname}</td>
                            <td><input type="checkbox" checked={addChecked[row.UserID]} onChange={(e) => setUsers(e, row)}/></td>
                            {selectedUsers.length > 0 && <td>{row.Admin === '2' && 
                            <input type="checkbox" checked={adminChecked[row.UserID]} onChange={(e) => setAdminUsers(e, row)}></input>}</td>}
                            {someAdded() && <td>{added[row.UserID] && 
                            <button style={{border: 'groove'}} className="checkInButton" onClick={() => unadd(row) }>unadd</button>}</td>}
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
            <div>
            <button className="checkInButton" onClick={() => addSelectedUsers()}>Add Selected Users</button>
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const DeleteUser = () => {
    const [rows, setRows] = useState([]);
    const [finalRows, setFinalRows] = useState([]);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState([]);
    const [admin, setAdmin] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [id_search, setIdSearch] = useState('');
    const [name_search, setNameSearch] = useState('');
    const [fname_search, setFnameSearch] = useState('');
    const [lname_search, setLnameSearch] = useState('');
    const [admin_search, setAdminSearch] = useState('');
    const [sort, setSort] = useState({sortKey: "UserID", dir: "ASC"});
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
        setAdmin(JSON.parse(Cookies.get("User")).UserID);
        getUsers().then(users => {
            users = JSON.parse(users).Users;
            setRows(users.filter(user => {return user.Active === '1';}));
            for(let i = 0; i<users.length; i++) {
                deleted[users[i].UserID] = false;
            }
        });
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
    },[rows, sort, search, id_search, name_search, fname_search, lname_search,
       admin_search]);

    function deleteSelectedUsers() {
        if(selectedUsers.length === 0) {
            setResult("Please select at least one user to delete.");
            return
        }
        var userIDs = selectedUsers.map((user) => {
            return user.UserID;
        });
        deleteUsers(userIDs, admin).then(resp => {       
            setResult("Users successfully deleted!");   
            for(let i=0; i<userIDs.length; i++)  {
                deleted[userIDs[i]] = true;
            }
        })
    }

    function undelete(user) {
        undeleteUser(user.UserID, admin).then(resp => {
            setResult(`User ${user.UserID} undeleted successfully!`);
            deleted[user.UserID] = false;
        })
    }

    const setUsers = (event, user) => {
        const selected = event.target.checked;
        if (selected) {
            setSelectedUsers([...selectedUsers, user]);
        } else {
            setSelectedUsers(selectedUsers.filter(element => element !== user));
        }

        setResult("");
    }

    const someDeleted = () => {
        for(let i=0; i<rows.length; i++) {
            if(deleted[rows[i].UserID]) {
                return true;
            }
        }
        return false;
    }

    function chooseSort(column) {
        setSort({
            sortKey: column,
            dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
          })
    }
  
    function sortItems(itemList) {
        if (sort.dir === 'ASC') {
            if(sort.sortKey === "UserID") {
            return itemList.sort((a,b) => 
                parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
            );
            }
            return itemList.sort((a,b) => 
            a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
            );
        }
        else {
            if(sort.sortKey === "UserID") {
            return itemList.sort((a,b) => 
                parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
            );
            }
            return itemList.sort((a,b) =>
            a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
            );
        }
    }

    function getFinalRows() {
        var filteredRows = rows.filter((user) => {
            return (
                ((id_search.toLowerCase().trim() === '' ? user.UserID.toLowerCase().includes(id_search.toLowerCase().trim()) : user.UserID.toLowerCase() === (id_search.toLowerCase().trim()))
                && user.Username.toLowerCase().includes(name_search.toLowerCase().trim())
                && user.Fname.toLowerCase().includes(fname_search.toLowerCase().trim())
                && user.Lname.toLowerCase().includes(lname_search.toLowerCase().trim())
                && user.Admin.toLowerCase().includes(admin_search.toLowerCase().trim()))
                && ((search.toLowerCase().trim() === '' ? user.UserID.toLowerCase().includes(search.toLowerCase().trim()) : user.UserID.toLowerCase() === (search.toLowerCase().trim())) 
                || user.Username.toLowerCase().includes(search.toLowerCase().trim())
                || user.Fname.toLowerCase().includes(search.toLowerCase().trim())
                || user.Lname.toLowerCase().includes(search.toLowerCase().trim())
                || user.Admin.toLowerCase().includes(search.toLowerCase().trim()))
            )
        });
  
        var sortedRows = sortItems(filteredRows);
        setFinalRows(sortedRows);
    }
    
    return (
        <Container>
            <h3 className="scanItems">Select Users to be Deleted</h3>
            <Form>
                <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
                </InputGroup>
            </Form>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="userID">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setIdSearch(e.target.value)} placeholder='Search by User ID'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("UserID")}>User ID</div>
                    </th>
                    <th className="username">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setNameSearch(e.target.value)} placeholder='Search by Username'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("Username")}>Username</div>
                    </th>
                    <th className="fname">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setFnameSearch(e.target.value)} placeholder='Search by First Name'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("Fname")} className="fname">F. Name</div>
                    </th>
                    <th className="lname">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setLnameSearch(e.target.value)} placeholder='Search by Last Name'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("Lname")}>L. Name</div>
                    </th>
                    <th className="admin">
                        <Form>
                        <InputGroup className='my-3'>
                            <Form.Control onChange={(e) => setAdminSearch(e.target.value)} placeholder='Search by Admin Status'/>
                        </InputGroup>
                        </Form>
                        <div onClick={() => chooseSort("Admin")}>Admin</div>
                    </th>
                    <th className="">Delete</th>
                    {someDeleted() && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                {finalRows.slice((page - 1) * 10, (page - 1) * 10 + 10)
                .map((row, i) => (
                        <tr key={row.UserID} className="tuple">
                            <td>{row.UserID}</td>
                            <td>{row.Username}</td>
                            <td>{row.Fname}</td>
                            <td>{row.Lname}</td>
                            <td>{row.Admin}</td>
                            <td><input type="checkbox" onChange={(e) => setUsers(e, row)}/></td>
                            {someDeleted() && <td>{deleted[row.UserID] && <button style={{border: 'groove'}} className="checkInButton" onClick={() => undelete(row) }>undelete</button>}</td>}
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
            <div>
            <button className="checkInButton" onClick={() => deleteSelectedUsers()}>Delete Selected Users</button>
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}