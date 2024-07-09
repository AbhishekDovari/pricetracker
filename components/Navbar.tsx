import React from 'react'
import Link from 'next/link';
import Image from 'next/image';

const navIcons=[
  {src: '/assets/icons/search.svg', alt: 'Search'},
  {src: '/assets/icons/black-heart.svg', alt: 'Favorites'},
  // {src: '/assets/icons/cart.svg', alt: 'Cart'},
  {src: '/assets/icons/user.svg', alt: 'User'},
]

const Navbar = () => {
  return (
    
    <header className='w-full'>
      <nav className='nav'>
      <Link href="/" className="flex items-center gap-1">
        <img 
        src="/assets/icons/logo.svg"
        width={30}
        height={30}
        alt="Logo"
        />
        <p className='nav-logo'>
          Price<span className='text-primary'>Tracker</span>
        </p>
      </Link>

      <div className='flex items-center gap-6'>
        {navIcons.map((icon)=>
          <Image 
          key={icon.alt}
          src={icon.src}
          alt={icon.alt}
          width={30}
          height={30}
          />
        
        )}
      </div>
      </nav>
    </header>
  )
}

export default Navbar