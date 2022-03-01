#!/usr/bin/env node
import { program } from 'commander'
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs'
import { homedir } from 'os'

const CONFIG_DIRECTORY = `${homedir()}/.config`
const WIPECLEAN_CONFIG_DIRECTORY = `${CONFIG_DIRECTORY}/wipeclean`
const CONFIG_FILE = `${WIPECLEAN_CONFIG_DIRECTORY}/config.json`

const BRUSH_WIDTH = 6
const DEFORMATION_FACTOR = 2
const DELAY = 3

const COLUMNS = process.stdout.columns
const ROWS = process.stdout.rows

function startDrawing(speed = 150) {
  const msPerFrame = 1000 / speed
  const zigZagPath = getZigZagPath()
  const rectangulaPath = getRectangularPath(zigZagPath[zigZagPath.length - 1])
  const finalPath = [...zigZagPath, ...rectangulaPath]

  finalPath.forEach((point, index) => {
    const BurshPoints = getBrushPoints(point.x, point.y, point.angle)

    //draw Brush
    setTimeout(() => {
      drawPoints(BurshPoints)
    }, index * msPerFrame)

    //erase brush with a DELAY
    if (index + DELAY >= 0)
      setTimeout(() => {
        drawPoints(BurshPoints, ' ')
      }, (index + DELAY) * msPerFrame)
  })

  //clear the screen and remove all log
  setTimeout(() => {
    process.stdout.cursorTo(0, 0)
    process.stdout.write('\x1Bc')
  }, (finalPath.length + DELAY) * msPerFrame)
}

function getZigZagPath() {
  //get half circle path
  const circlePointsLeft = getCirclefPoints(
    Math.floor(BRUSH_WIDTH / 2),
    Math.PI / 2,
    (Math.PI * 3) / 2,
  ).reverse()
  const circlePointsRight = getCirclefPoints(
    Math.floor(BRUSH_WIDTH / 2),
    (Math.PI * 3) / 2,
    (Math.PI * 5) / 2,
  )

  //points by which the squeegee
  const keyPoints = getKeyPoints()

  let points = []
  for (let step = 0; step < keyPoints.length; step++) {
    const linePoints = getLinePoints(
      keyPoints[step][0].x,
      keyPoints[step][0].y,
      keyPoints[step][1].x,
      keyPoints[step][1].y,
    )
    const turnPoints = (
      step % 2 == 0 ? circlePointsRight : circlePointsLeft
    ).map((point) => ({
      x: point.x + keyPoints[step][1].x,
      y: point.y + keyPoints[step][1].y + BRUSH_WIDTH / 2,
      angle: point.angle,
    }))
    points = [...points, ...linePoints, ...turnPoints]
  }
  return points
}

function getRectangularPath(closestStartPoint) {
  let points = []
  const verticalMargin = BRUSH_WIDTH / 2
  const horizontalMargin = (BRUSH_WIDTH * DEFORMATION_FACTOR) / 2
  const startPoint = { x: closestStartPoint.x, y: ROWS - verticalMargin }

  for (let x = startPoint.x; x > -2; x--) {
    points.push({ y: ROWS - verticalMargin + 1, x, angle: Math.PI / 2 })
  }

  let anglePoints = getCirclefPoints(
    Math.floor(BRUSH_WIDTH / 2),
    0,
    Math.PI / 2,
  )
  anglePoints = anglePoints
    .map((point) => ({
      x: point.x,
      y: point.y + ROWS - verticalMargin * 2,
      angle: point.angle,
    }))
    .reverse()
  points = [...points, ...anglePoints]

  for (let y = ROWS - verticalMargin - 3; y > -1; y--) {
    points.push({ y, x: horizontalMargin - 1, angle: Math.PI })
    points.push({ y, x: horizontalMargin - 1, angle: Math.PI })
  }

  let anglePoints2 = getCirclefPoints(
    Math.floor(BRUSH_WIDTH / 2),
    Math.PI,
    (Math.PI * 3) / 2,
  ).reverse()
  anglePoints2 = anglePoints2
    .map((point) => ({
      x: point.x + horizontalMargin * 2,
      y: point.y,
      angle: point.angle,
    }))
    .reverse()
  points = [...points, ...anglePoints2]

  for (let x = horizontalMargin + 3; x < COLUMNS; x++) {
    points.push({ y: verticalMargin - 1, x, angle: Math.PI / 2 })
  }

  let anglePoints3 = getCirclefPoints(
    Math.floor(BRUSH_WIDTH / 2),
    Math.PI,
    (Math.PI * 3) / 2,
  ).reverse()
  anglePoints3 = anglePoints3.map((point) => ({
    x: point.x + COLUMNS,
    y: point.y + verticalMargin * 2,
    angle: point.angle,
  }))
  points = [...points, ...anglePoints3]

  for (let y = verticalMargin + 3; y < ROWS; y++) {
    points.push({ y, x: COLUMNS - horizontalMargin, angle: Math.PI })
    points.push({ y, x: COLUMNS - horizontalMargin, angle: Math.PI })
  }

  let anglePoints4 = getCirclefPoints(
    Math.floor(BRUSH_WIDTH / 2),
    (Math.PI * 3) / 2,
    (Math.PI * 4) / 2,
  )
  anglePoints4 = anglePoints4
    .map((point) => ({
      x: point.x + COLUMNS - horizontalMargin * 2,
      y: point.y + ROWS,
      angle: point.angle,
    }))
    .reverse()
  points = [...points, ...anglePoints4]

  for (let x = COLUMNS - horizontalMargin - 3; x > startPoint.x; x--) {
    points.push({ y: ROWS - verticalMargin, x, angle: Math.PI / 2 })
  }
  return points
}

function getCirclefPoints(radius, start, end) {
  const angleStep = 5
  let points = []
  for (
    let angle = start;
    angle < end;
    angle += ((2 * Math.PI) / 360) * angleStep
  ) {
    points.push({
      x: Math.cos(angle) * radius * DEFORMATION_FACTOR,
      y: Math.sin(angle) * radius,
      angle,
    })
  }
  return points
}

function getKeyPoints() {
  let points = []
  const halfBrushDeformed = (BRUSH_WIDTH * DEFORMATION_FACTOR) / 2
  let step = 0

  while ((BRUSH_WIDTH / 2) * 3 + (step - 1) * BRUSH_WIDTH < ROWS) {
    points.push([
      {
        x: halfBrushDeformed * 2,
        y: (BRUSH_WIDTH / 2) * 2 + step * BRUSH_WIDTH,
      },
      {
        x: COLUMNS - halfBrushDeformed * 2,
        y: (BRUSH_WIDTH / 2) * 1 + step * BRUSH_WIDTH,
      },
    ])
    points.push([
      {
        x: COLUMNS - halfBrushDeformed * 2,
        y: (BRUSH_WIDTH / 2) * 3 + step * BRUSH_WIDTH,
      },
      {
        x: halfBrushDeformed * 2,
        y: (BRUSH_WIDTH / 2) * 2 + step * BRUSH_WIDTH,
      },
    ])
    step++
  }
  return points
}

function getLinePoints(startX, startY, endX, endY) {
  let points = []
  const Ystep = (endY - startY) / Math.abs(endX - startX)
  const Xdirection = endX > startX ? 1 : -1
  const angle = -Math.atan((endY - startX) / startY - endY)
  for (let step = 0; step < Math.abs(endX - startX); step++) {
    points.push({
      x: step * Xdirection + startX,
      y: startY + Ystep * step,
      angle,
    })
  }
  return points
}

function getBrushPoints(x, y, angle) {
  let newX = 0
  let newY = 0
  let points = []
  const halfBrushWidth = BRUSH_WIDTH / 2

  const oppositeAngle = angle + Math.PI

  for (let step = 0; step < halfBrushWidth * DEFORMATION_FACTOR; step++) {
    newX =
      x +
      Math.cos(angle) *
        ((halfBrushWidth / (halfBrushWidth * DEFORMATION_FACTOR)) * step) *
        DEFORMATION_FACTOR
    newY =
      y +
      Math.sin(angle) *
        ((halfBrushWidth / (halfBrushWidth * DEFORMATION_FACTOR)) * step)
    points.push({ x: newX, y: newY })

    newX =
      x +
      Math.cos(oppositeAngle) *
        ((halfBrushWidth / (halfBrushWidth * DEFORMATION_FACTOR)) * step) *
        DEFORMATION_FACTOR
    newY =
      y +
      Math.sin(oppositeAngle) *
        ((halfBrushWidth / (halfBrushWidth * DEFORMATION_FACTOR)) * step)
    points.push({ x: newX, y: newY })
  }
  return points
}

function drawnStringAt(x, y, str) {
  process.stdout.cursorTo(Math.round(x), Math.round(y))
  process.stdout.write(str)
}

function drawPoints(list, character = '#') {
  list.forEach((point) => {
    if (point.y < ROWS && point.x < COLUMNS)
      drawnStringAt(point.x, point.y, character)
  })
}

function safeCreateDirectory(filePath) {
  if (existsSync(filePath)) {
    return
  }
  mkdirSync(filePath)
}

function safeReadConfig(filePath) {
  if (!existsSync(filePath)) {
    return {}
  }
  const configJson = readFileSync(CONFIG_FILE, 'utf-8')
  return JSON.parse(configJson)
}

function updateSavedSpeed(newSpeed) {
  safeCreateDirectory(CONFIG_DIRECTORY)
  safeCreateDirectory(WIPECLEAN_CONFIG_DIRECTORY)
  try {
    writeFileSync(CONFIG_FILE, JSON.stringify({ speed: newSpeed }))
    console.log(`Updated brush speed to ${newSpeed} fps.`)
  } catch (e) {
    console.log('Failed to update brush speed:', e)
  }
}

function drawWithSavedSpeed() {
  const { speed } = safeReadConfig(CONFIG_FILE)
  startDrawing(speed)
}

program
  .option('-s, --speed <speed>', 'use brush speed in frames per second')
  .action(({ speed: newSpeed }) => {
    if (newSpeed) {
      if (process.platform === 'win32') {
        console.log('Custom brush speed is not supported on Windows.')
        return
      }
      updateSavedSpeed(newSpeed)
    } else {
      drawWithSavedSpeed()
    }
  })

program.parse()
