"use client"

import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';

const heroImages = [
    {src: '/assets/images/hero-1.svg', alt: 'SmartWatch'},
    {src: '/assets/images/hero-2.svg', alt: 'Bag'},
    {src: '/assets/images/hero-3.svg', alt: 'lamp'},
    {src: '/assets/images/hero-4.svg', alt: 'air fryer'},
    {src: '/assets/images/hero-5.svg', alt: 'chair'},
    
]

const HeroCarousel = () => {
  return (
    <div className="hero-carousel">
        <Carousel
            showThumbs  = {false}
            autoPlay
            infiniteLoop
            interval={3000}
            showArrows={false}
            showStatus={false}
        >
            {heroImages.map((image) => (
                <Image 
                src={image.src}
                alt={image.alt}
                width={484}
                height={484}
                className="object-contain"
                key={image.alt}
                />
            ))}
        </Carousel>
        <Image
        src="/assets/icons/hand-drawn-arrow.svg"
        alt="Arrow"
        width={175}
        height={175}
        className='max-xl:hidden absolute -left-[15%] bottom-0'

         />

    </div>
  )
}

export default HeroCarousel