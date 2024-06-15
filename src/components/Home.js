import React from 'react'
import { Link } from 'react-router-dom'
import './home.css'

const Home = () => {
  return (
    <div className='home '>
      <div className='card'>
        <div className='card1'>
            <h1 className='text-blue-600 text-2xl font-bold'>Vkart</h1>
            <p>Shop with us we have best products available online</p>
            <button><Link to="/products">Shop now</Link></button>
        </div>
        <div>
            <img className='img' src="https://cdn.dribbble.com/users/1042380/screenshots/7107889/media/1566b58ed94e8ee2f7561079641d5a29.png" alt="avatar"/>
        </div>
      </div>
    </div>
  )
}

export default Home
