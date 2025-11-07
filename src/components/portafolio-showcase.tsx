"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"

interface MathUtils {
  lerp: (a: number, b: number, n: number) => number
  norm: (value: number, min: number, max: number) => number
}

interface SlideData {
  id: number | string
  image: string
  title: string
  project: string
  category: string
  // Enhanced fields for story data
  storyId?: string
  logline?: string
  genre?: string
  chaptersCount?: number
  charactersCount?: number
  marketabilityScore?: number
  status?: string
  createdAt?: string
  visualStyle?: string
}

interface PortfolioShowcaseProps {
  slides?: SlideData[]
  onStoryClick?: (storyId: string) => void
  onStoryDelete?: (storyId: string) => Promise<void>
  canDelete?: boolean
  isActive?: boolean
}

const math: MathUtils = {
  lerp: (a, b, n) => (1 - n) * a + n * b,
  norm: (value, min, max) => (value - min) / (max - min),
}

const defaultSlides: SlideData[] = [
  {
    id: 1,
    image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png",
    title: "Oak Refuge",
    project: "Corpus Studio",
    category: "Films",
  },
  {
    id: 2,
    image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png",
    title: "Teton Residence",
    project: "Ro Rocket Design",
    category: "Shorts",
  },
  {
    id: 3,
    image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png",
    title: "Oak Refuge",
    project: "Corpus Studio",
    category: "youtube",
  },
]

const filterCategories = ["Films", "Shorts", "youtube", "Social Network"]

export default function PortfolioShowcase({ 
  slides = defaultSlides, 
  onStoryClick, 
  onStoryDelete, 
  canDelete = false,
  isActive = false 
}: PortfolioShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const contentLastRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const logoMaskRef = useRef<HTMLImageElement>(null)
  const maskSlicesRef = useRef<HTMLDivElement[]>([])
  const maskLineRef = useRef<HTMLDivElement>(null)
  const transitionImagesRef = useRef<HTMLDivElement[]>([])
  const transitionTitlesRef = useRef<HTMLDivElement[]>([])

  const [activeFilter, setActiveFilter] = useState("Films")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStarted, setDragStarted] = useState(false)

  const dataRef = useRef({
    current: 0,
    last: { one: 0, two: 0 },
    on: 0,
    dragDistance: 0,
  })

  const boundsRef = useRef({
    width: 0,
    max: 0,
  })

  const rAFRef = useRef<number | null>(null)

  const setBounds = useCallback(() => {
    if (!contentRef.current) return

    const slides = contentRef.current.querySelectorAll(".js-slide")
    let w = 0

    slides.forEach((slide, index) => {
      const element = slide as HTMLElement
      const bounds = element.getBoundingClientRect()

      element.style.position = "absolute"
      element.style.top = "0"
      element.style.left = `${w}px`

      w += bounds.width

      if (index === slides.length - 1) {
        boundsRef.current.width = w
        boundsRef.current.max = w - window.innerWidth * 0.2

        if (contentRef.current) {
          contentRef.current.style.width = `${w + window.innerWidth * 0.6}px`
        }
        if (contentLastRef.current) {
          contentLastRef.current.style.width = `${w + window.innerWidth * 0.6}px`
        }
      }
    })
  }, [])

  const clamp = useCallback(() => {
    dataRef.current.current = Math.min(Math.max(dataRef.current.current, 0), boundsRef.current.max)
  }, [])

  const drag = useCallback(
    (e: MouseEvent) => {
      dataRef.current.current = dataRef.current.current + (dataRef.current.on - e.clientX)
      dataRef.current.on = e.clientX
      clamp()
    },
    [clamp],
  )

  const run = useCallback(() => {
    dataRef.current.last.one = math.lerp(dataRef.current.last.one, dataRef.current.current, 0.085)
    dataRef.current.last.one = Math.floor(dataRef.current.last.one * 100) / 100

    dataRef.current.last.two = math.lerp(dataRef.current.last.two, dataRef.current.current, 0.08)
    dataRef.current.last.two = Math.floor(dataRef.current.last.two * 100) / 100

    const diff = dataRef.current.current - dataRef.current.last.one
    const acc = diff / window.innerWidth
    const velo = +acc
    const bounce = 1 - Math.abs(velo * 0.25)
    const skew = velo * 7.5

    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(-${dataRef.current.last.one.toFixed(2)}px, 0, 0) scaleY(${bounce}) skewX(${skew}deg)`
    }

    if (contentLastRef.current) {
      contentLastRef.current.style.transform = `translate3d(-${dataRef.current.last.two.toFixed(2)}px, 0, 0) scaleY(${bounce})`
    }

    const scale = math.norm(dataRef.current.last.two, 0, boundsRef.current.max)

    if (handleRef.current) {
      handleRef.current.style.transform = `scaleX(${scale})`
    }

    rAFRef.current = requestAnimationFrame(run)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStarted(false)
    dataRef.current.on = e.clientX
    dataRef.current.dragDistance = 0
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStarted(false)
    dataRef.current.on = e.touches[0].clientX
    dataRef.current.dragDistance = 0
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const currentDistance = Math.abs(e.clientX - dataRef.current.on)
      dataRef.current.dragDistance = currentDistance
      if (currentDistance > 5) {
        setDragStarted(true)
      }
      drag(e)
    },
    [isDragging, drag],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return
      const touch = e.touches[0]
      const currentDistance = Math.abs(touch.clientX - dataRef.current.on)
      dataRef.current.dragDistance = currentDistance
      if (currentDistance > 5) {
        setDragStarted(true)
      }

      dataRef.current.current = dataRef.current.current + (dataRef.current.on - touch.clientX)
      dataRef.current.on = touch.clientX
      clamp()
    },
    [isDragging, clamp],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    window.scrollTo(0, dataRef.current.current)
    setTimeout(() => setDragStarted(false), 100)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => setDragStarted(false), 100)
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isDragging || isTransitioning) return

      e.preventDefault()
      const delta = e.deltaY || e.deltaX
      dataRef.current.current += delta * 2 // Multiply by 2 for faster scrolling
      clamp()
    },
    [isDragging, isTransitioning, clamp],
  )

  const createTransitionTimeline = useCallback(() => {
    if (!maskRef.current) return

    const mask = maskRef.current
    const slices = maskSlicesRef.current
    const logo = logoMaskRef.current
    const line = maskLineRef.current
    const images = transitionImagesRef.current
    const titles = transitionTitlesRef.current

    window.scrollTo(0, 0)
    dataRef.current.current = 0
    dataRef.current.last.one = 0
    dataRef.current.last.two = 0

    mask.style.visibility = "visible"
    mask.style.opacity = "1"

    slices.forEach((slice, index) => {
      if (slice) {
        slice.style.transform = "translateX(100%)"
        slice.style.transition = "transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)"
        setTimeout(() => {
          slice.style.transform = "translateX(0%)"
        }, index * 75)
      }
    })

    setTimeout(() => {
      if (logo) {
        logo.style.visibility = "visible"
        logo.style.opacity = "1"
        logo.style.transform = "translateY(-100%) rotate(10deg)"
        logo.style.transition = "all 1s cubic-bezier(0.19, 1, 0.22, 1)"
        setTimeout(() => {
          logo.style.transform = "translateY(0%) rotate(0deg)"
        }, 50)
      }

      if (line) {
        line.style.visibility = "visible"
        line.style.opacity = "1"
        const lineInner = line.querySelector(".mask-line__inner") as HTMLElement
        if (lineInner) {
          lineInner.style.transform = "scaleX(0)"
          lineInner.style.transition = "transform 1s cubic-bezier(0.19, 1, 0.22, 1)"
          setTimeout(() => {
            lineInner.style.transform = "scaleX(1)"
          }, 750)
        }
      }
    }, 1000)

    setTimeout(() => {
      if (logo) {
        logo.style.transform = "translateY(105%)"
      }
      if (line) {
        const lineInner = line.querySelector(".mask-line__inner") as HTMLElement
        if (lineInner) {
          lineInner.style.transformOrigin = "right"
          lineInner.style.transform = "scaleX(0)"
        }
      }

      slices.forEach((slice, index) => {
        if (slice) {
          setTimeout(() => {
            slice.style.transform = "translateX(100%)"
          }, index * 75)
        }
      })

      images.forEach((img, index) => {
        if (img) {
          const figure = img.querySelector("figure") as HTMLElement
          if (figure) {
            img.style.transform = "translateX(-100%)"
            figure.style.transform = "translateX(100%)"
            img.style.transition = "transform 1.25s cubic-bezier(0.19, 1, 0.22, 1)"
            figure.style.transition = "transform 1.25s cubic-bezier(0.19, 1, 0.22, 1)"

            setTimeout(() => {
              img.style.transform = "translateX(0%)"
              figure.style.transform = "translateX(0%)"
            }, index * 50)
          }
        }
      })

      titles.forEach((title, index) => {
        if (title) {
          title.style.transform = "translateY(100%)"
          title.style.transition = "transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)"
          setTimeout(() => {
            title.style.transform = "translateY(0%)"
          }, index * 50)
        }
      })
    }, 850)

    setTimeout(() => {
      mask.style.visibility = "hidden"
      mask.style.opacity = "0"
      setIsTransitioning(false)
    }, 2500)
  }, [])

  const handleFilterClick = useCallback(
    (category: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isTransitioning || dragStarted) return

      setActiveFilter(category)
      setIsTransitioning(true)

      createTransitionTimeline()
    },
    [isTransitioning, dragStarted, createTransitionTimeline],
  )

  const handleCardClick = useCallback(
    (e: React.MouseEvent, slide: SlideData) => {
      e.preventDefault()
      e.stopPropagation()
      if (dragStarted || isDragging) return

      console.log("[Portfolio] Story clicked:", slide.title, "ID:", slide.storyId)
      
      // Open story detail modal if we have a storyId
      if (slide.storyId && onStoryClick) {
        onStoryClick(slide.storyId);
      }
    },
    [dragStarted, isDragging],
  )

  const handleDeleteClick = useCallback(
    async (e: React.MouseEvent, slide: SlideData) => {
      e.stopPropagation()
      e.preventDefault()
      
      if (!slide.storyId || !onStoryDelete) return
      
      const confirmed = window.confirm(
        `Are you sure you want to delete "${slide.title}"? This action cannot be undone.`
      )
      
      if (confirmed) {
        console.log("[Portfolio] Deleting story:", slide.title, "ID:", slide.storyId)
        try {
          await onStoryDelete(slide.storyId)
        } catch (error) {
          console.error("Error deleting story:", error)
          alert("Failed to delete story. Please try again.")
        }
      }
    },
    [onStoryDelete],
  )

  useEffect(() => {
    const initializePositions = () => {
      setBounds()
      // Force initial positioning
      if (contentRef.current) {
        const slides = contentRef.current.querySelectorAll(".js-slide")
        slides.forEach((slide, index) => {
          const element = slide as HTMLElement
          element.style.position = "absolute"
          element.style.top = "0"
          element.style.left = `${index * (window.innerWidth * 0.5)}px`
        })
      }
    }

    // Initialize immediately and after a short delay to ensure DOM is ready
    initializePositions()
    setTimeout(initializePositions, 100)

    const handleResize = () => setBounds()

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove, { passive: false })
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)

    rAFRef.current = requestAnimationFrame(run)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)

      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current)
      }
    }
  }, [setBounds, handleMouseMove, handleMouseUp, handleWheel, handleTouchMove, handleTouchEnd, run])

  const duplicatedSlides = [...slides, ...slides]

  return (
    <div style={{ backgroundColor: '#000', width: '100%', height: '100%', position: 'relative' }}>
      <style>{`
        @font-face {
          font-family: 'font';
          src: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/OakesGrotesk-Semi-Bold.woff.woff2') format('woff2');
          src: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/OakesGrotesk-Semi-Bold.woff.woff2') format('woff');
          font-weight: normal;
          font-style: normal;
        }

        html, body {
          height: 100%;
          font-family: 'helvetica neue';
        }

        body {
          height: 100%;
          overflow-y: scroll;
          padding: 0;
          margin: 0;
          background-color: #000;
          user-select: none;
        }

        h1, h2 {
          font-weight: normal;
        }

        * {
          box-sizing: border-box;
        }

        figure {
          padding: 0;
          margin: 0;
        }

        .scroll {
          cursor: grab;
          position: fixed;
          top: 50%;
          left: 15%;
          height: 60vh;
          width: 85%;
          overflow: hidden;
          transform: translateY(-50%);
          background-color: #000;
        }

        .scroll-content {
          display: flex;
          white-space: nowrap;
          position: relative;
          height: 60vh;
        }

        .scroll-content--last {
          position: absolute;
          top: 0;
          left: 0;
        }

        .hi {
          position: fixed;
          bottom: 2vw;
          left: 2vw;
          color: #fff;
          font-size: 1vw;
          z-index: 999;
          text-decoration: none;
        }

        .logo {
          position: relative;
        }

        .logo--top {
          position: fixed;
          top: 2vw;
          left: 2vw;
          z-index: 10;
        }

        .logo--top img {
          height: 1vw;
          width: auto;
        }

        .logo--resize {
          margin-bottom: 1rem;
        }

        .logo--resize img {
          width: 10rem;
          margin: 0 auto;
        }

        .logo--mask {
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .logo--mask img {
          width: 15rem;
          height: auto;
          margin: 0 auto;
          visibility: hidden;
          opacity: 0;
        }

        .menu-btn {
          position: fixed;
          top: 2vw;
          right: 2vw;
          display: flex;
          align-items: center;
          text-decoration: none;
          z-index: 999;
        }

        .menu-btn__circles {
          position: relative;
          height: 0.45vw;
          width: 0.45vw;
          margin-right: 0.75vw;
        }

        .menu-btn__circle {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #fff;
          border-radius: 50%;
          transition: all 0.5s ease;
        }

        .menu-btn__circle--top {
          visibility: hidden;
          opacity: 0;
          transform: translateY(-60px);
        }

        .menu-btn:hover .menu-btn__circle--top {
          visibility: visible;
          opacity: 1;
          transform: translateY(0);
        }

        .menu-btn:hover .menu-btn__circle--bottom {
          opacity: 0;
          transform: translateY(15px);
        }

        .menu-btn__text {
          color: #fff;
          font-size: 1vw;
        }

        .filter {
          position: absolute;
          top: 1%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .filter__list {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .filter__item {
          display: block;
        }

        .filter__link {
          position: relative;
          display: block;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          padding: 0 1.5vw;
          font-size: 1.15vw;
          overflow: hidden;
        }

        .filter__link-mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #111;
          transform: translate3d(-100%, 0, 0);
          transition: transform .75s ease;
          z-index: 2;
        }

        .filter__link-mask span {
          display: block;
          padding: 0 1.5vw;
          font-size: 1.15vw;
          transform: translate3d(100%, 0, 0);
          transition: transform .75s ease;
          color: #fff;
        }

        .filter__link:hover .filter__link-mask,
        .filter__link.is-active .filter__link-mask {
          transform: translate3d(0, 0, 0);
        }

        .filter__link:hover .filter__link-mask span,
        .filter__link.is-active .filter__link-mask span {
          transform: translate3d(0, 0, 0);
        }

        .slide {
          display: flex;
          width: 50vw;
          height: 100%;
          padding: 5vh 0;
        }

        .slide--1 {
          align-items: center;
        }

        .slide--2 {
          align-items: center;
        }

        .slide--3 {
          align-items: center;
        }

        .slide:last-child {
          width: 65vw;
          padding-right: 15vw;
        }

        .slide__inner {
          position: relative;
          padding-left: 15vw;
          width: 100%;
        }

        .slide__sub-title {
          position: absolute;
          top: 6%;
          left: 5vw;
          color: rgba(255, 255, 255, 0.5);
          font-size: 1vw;
          margin-bottom: 2vh;
        }

        .slide__title {
          position: absolute;
          top: 12%;
          left: 7.5vw;
          color: #fff;
          font-size: 4vw;
          z-index: 2;
          overflow: hidden;
          margin: 0;
        }

        .slide__project {
          color: #fff;
          position: absolute;
          bottom: -8vh;
          right: 5%;
          font-size: 1.15vw;
          padding-top: 1.5vw;
          z-index: 10;
        }

        .slide__img {
          position: relative;
          overflow: hidden;
          padding-top: 65%;
          width: 100%;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 1;
        }

        .slide__img:hover {
          transform: scale(1.25) !important;
          z-index: 10 !important;
        }

        .scrollbar {
          position: fixed;
          bottom: 3%;
          left: 20%;
          right: 20%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.25);
          z-index: 15;
        }

        .scrollbar__handle {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform: scaleX(0);
          transform-origin: left;
          background-color: #fff;
        }

        .mask {
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          visibility: hidden;
          opacity: 0;
        }

        .mask__slice {
          flex: 1;
          background-color: #000;
          transform: translateX(100%);
        }

        .mask__inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
        }

        .mask-line {
          position: relative;
          transform-origin: left;
          width: 20rem;
          height: 2px;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.25);
          visibility: hidden;
          opacity: 0;
        }

        .mask-line__inner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #fff;
          transform-origin: left;
          transform: scaleX(0);
        }

        .resize {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          z-index: 99;
        }

        .resize__inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          color: #fff;
          text-align: center;
          text-decoration: none;
        }

        .resize span {
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 800px) {
          .resize {
            display: block;
          }
        }

        @media (max-height: 600px) {
          .resize {
            display: block;
          }
        }
      `}</style>

      <figure className="logo logo--top js-trigger">
        <div
          style={{
            color: "#fff",
            fontSize: "1.2vw",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Auracle
        </div>
      </figure>

      <a href="https://codepen.io/ReGGae/full/QZxdVX/" target="_blank" className="resize" rel="noreferrer">
        <div className="resize__inner">
          <figure className="logo logo--resize">
            <div
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Auracle
            </div>
          </figure>
          <p>
            Please view in <span>full page</span> mode
          </p>
        </div>
      </a>

      <div style={{ display: "none" }}>
        <a href="https://twitter.com/Jesper_Landberg?lang=en" target="_blank" className="hi" rel="noreferrer">
          Hi
        </a>

        <a
          href="https://dribbble.com/shots/5321013-Habital-Showcase-Alternative"
          target="_blank"
          rel="noreferrer nofollow"
          className="menu-btn js-menu-btn"
        >
          <div className="menu-btn__circles">
            <span className="menu-btn__circle menu-btn__circle--top js-menu-btn__circle--top"></span>
            <span className="menu-btn__circle menu-btn__circle--bottom js-menu-btn__circle--bottom"></span>
          </div>
          <div className="menu-btn__text">See shot</div>
        </a>
      </div>

      {/* Filter Navigation - Only show when component is active */}
      {isActive && (
        <nav className="filter" style={{ 
          position: 'fixed', 
          top: '120px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px 20px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <ul className="filter__list">
            {filterCategories.map((category) => (
              <li key={category} className="filter__item">
                <a
                  href="#"
                  className={`filter__link js-trigger ${activeFilter === category ? "is-active" : ""}`}
                  onClick={(e) => handleFilterClick(category, e)}
                >
                  <div className="filter__link-mask" aria-hidden="true">
                    <span>{category}</span>
                  </div>
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="scroll" ref={scrollRef} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
        <div className="scroll-content" ref={contentRef}>
          {duplicatedSlides.map((slide, index) => (
            <article
              key={`${slide.id}-${index}`}
              className={`slide slide--${(index % 3) + 1} js-slide`}
              onClick={(e) => handleCardClick(e, slide)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              {canDelete && slide.storyId && (
                <button
                  onClick={(e) => handleDeleteClick(e, slide)}
                  className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                  title={`Delete "${slide.title}"`}
                >
                  ×
                </button>
              )}
              <div className="slide__inner">
                <div
                  className="slide__img js-transition-img"
                  ref={(el) => {
                    if (el && !transitionImagesRef.current.includes(el)) {
                      transitionImagesRef.current[index] = el
                    }
                  }}
                >
                  <figure className="js-transition-img__inner">
                    <img src={slide.image || "/placeholder.svg"} draggable="false" alt={slide.title} />
                  </figure>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="scroll-content scroll-content--last" ref={contentLastRef}>
          {duplicatedSlides.map((slide, index) => (
            <article
              key={`last-${slide.id}-${index}`}
              className={`slide slide--${(index % 3) + 1} js-slide`}
              onClick={(e) => handleCardClick(e, slide)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              {canDelete && slide.storyId && (
                <button
                  onClick={(e) => handleDeleteClick(e, slide)}
                  className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                  title={`Delete "${slide.title}"`}
                >
                  ×
                </button>
              )}
              <div className="slide__inner">
                <div className="slide__sub-title">
                  <span>Project</span>
                </div>
                <h1 className="slide__title">
                  <div
                    className="js-transition-title"
                    ref={(el) => {
                      if (el && !transitionTitlesRef.current.includes(el)) {
                        transitionTitlesRef.current[index] = el
                      }
                    }}
                  >
                    {slide.title}
                  </div>
                </h1>
                <div className="slide__img slide__img--proxy"></div>
                <div className="slide__project">{slide.project}</div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="scrollbar">
        <div className="scrollbar__handle js-scrollbar__handle" ref={handleRef}></div>
      </div>

      <div className="mask js-mask" ref={maskRef}>
        <div
          className="mask__slice js-mask__slice"
          ref={(el) => {
            if (el) maskSlicesRef.current[0] = el
          }}
        ></div>
        <div
          className="mask__slice js-mask__slice"
          ref={(el) => {
            if (el) maskSlicesRef.current[1] = el
          }}
        ></div>
        <div
          className="mask__slice js-mask__slice"
          ref={(el) => {
            if (el) maskSlicesRef.current[2] = el
          }}
        ></div>
        <div className="mask__inner">
          <figure className="logo logo--mask">
            <div
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Auracle Film Studio
            </div>
          </figure>
          <div className="mask-line js-mask-line" ref={maskLineRef}>
            <div className="mask-line__inner js-mask-line"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
