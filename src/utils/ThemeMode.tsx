"use client"
import React from 'react'
import { useTheme } from "next-themes";


function ThemeMode() {
  const { systemTheme, theme, setTheme } = useTheme();

  function onSelectChangeTogle() {
    setTheme("light")
  }

  return (
    <div className=' cursor-pointer' onClick={() => { onSelectChangeTogle() }}>Switch Theme</div>
  )
}

export default ThemeMode