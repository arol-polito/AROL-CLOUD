import React from 'react'

const randomIntFromInterval  = (min, max) => // min and max included
  Math.floor(Math.random() * (max - min + 1) + min);

function areArraysEqual (array1, array2) {
  if (array1.length === array2.length)
    return array1.every(element => !!array2.includes(element))

  return false
}

// HIGHLIGHT TEXT WITH SEARCH TERM
function highlightText (input: string, fontWeight: number, highlightTerm: string) {
  if (highlightTerm === '') return input

  const startIndex = input.toLowerCase().indexOf(highlightTerm.toLowerCase())
  if (startIndex >= 0) {
    const endIndex = startIndex + highlightTerm.length

    return (
            <span>
                {input.slice(0, startIndex).toString()}
                <span
                    style={{
                      fontWeight: fontWeight + 200,
                      textDecoration: 'underline'
                    }}
                >
                    {input.slice(startIndex, endIndex).toString()}
                </span>
                {input.slice(endIndex).toString()}
            </span>
    )
  }

  return input
}

export default {
  areArraysEqual,
  randomIntFromInterval,
  highlightText
}
