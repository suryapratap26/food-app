import React from 'react'
import {asset} from './../../assets/asset'
import { Link } from 'react-router-dom'
const Sidebar = ({sidebarVisible}) => {
  return (
    <div className={`border-end bg-white ${sidebarVisible ?"" :'d-none'}`} id="sidebar-wrapper">
                <div className="sidebar-heading border-bottom bg-light"><img src={asset.logo} alt="logo of food app" height={48} width={48} /></div>
                <div className="list-group list-group-flush">
                    <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/addfood"><i className='bi bi-plus-circle m-2'></i>Add Food</Link>
                    <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/listfoods"><i className='bi bi-list-ul m-2'></i>List Foods</Link>
                    <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/orders"><i className='bi bi-cart m-2'></i>Orders</Link>
                   
                </div>
            </div>
           
  )
}

export default Sidebar