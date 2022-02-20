#!/usr/bin/env node

const columns = process.stdout.columns
const rows = process.stdout.rows

const burshWidth = 6
const deformationFactor = 2
const delay = 2
const frameSpeed = 10

function startDrawing() {

  let points = getFullPath()
  const squarePoints = getSquarePath(points[points.length - 1])
  points = [...points, ...squarePoints]

  //drawPoints(points)
  points.forEach((point, index) => {
    const BurshPoints = getBrushPoints(point.x, point.y, point.angle)
    setTimeout(() => {

      drawPoints(BurshPoints)
    }, index * frameSpeed)

    if (index + delay >= 0) setTimeout(() => {

      drawPoints(BurshPoints, ' ')
    }, ((index + delay) * frameSpeed))
  })
}

function getFullPath() {
  //get half circle path
  const circlePointsLeft = getCirclefPoints(Math.floor(burshWidth / 2), Math.PI / 2, Math.PI * 3 / 2).reverse()
  const circlePointsRight = getCirclefPoints(Math.floor(burshWidth / 2), Math.PI * 3 / 2, Math.PI * 5 / 2)

  const keyPoints = getKeyPoints()
  let points = []
  for (let step = 0; step < keyPoints.length; step++) {
    let linePoints = getLinePoints(keyPoints[step][0].x, keyPoints[step][0].y, keyPoints[step][1].x, keyPoints[step][1].y)
    let turnPoint = (step % 2 == 0 ? circlePointsRight : circlePointsLeft).map(point => (
      { x: point.x + keyPoints[step][1].x, y: point.y + keyPoints[step][1].y + burshWidth / 2, angle: point.angle }
    ))
    points = [...points, ...linePoints, ...turnPoint]
  }
  return points
}

function getSquarePath(closestStartPoint) {
  let points = []
  const verticalMargin = (burshWidth / 2)
  const horizontalMargin = ((burshWidth * deformationFactor) / 2)
  const startPoint = { x: closestStartPoint.x, y: rows - verticalMargin }

  for (let x = startPoint.x; x > -2; x--) {
    points.push({ y: rows - verticalMargin + 1, x, angle: Math.PI / 2 })
  }

  let anglePoints = getCirclefPoints(Math.floor(burshWidth / 2), 0, Math.PI / 2)
  anglePoints = anglePoints.map(point => ({ x: point.x, y: point.y + rows - verticalMargin * 2, angle: point.angle })).reverse()
  points = [...points, ...anglePoints]

  for (let y = rows - verticalMargin - 3; y > -1; y--) {
    points.push({ y, x: horizontalMargin - 1, angle: Math.PI })
    points.push({ y, x: horizontalMargin - 1, angle: Math.PI })
  }

  let anglePoints2 = getCirclefPoints(Math.floor(burshWidth / 2), Math.PI, Math.PI * 3 / 2).reverse()
  anglePoints2 = anglePoints2.map(point => ({ x: point.x + horizontalMargin * 2, y: point.y, angle: point.angle })).reverse()
  points = [...points, ...anglePoints2]

  for (let x = horizontalMargin + 3; x < columns; x++) {
    points.push({ y: verticalMargin - 1, x, angle: Math.PI / 2 })
  }

  let anglePoints3 = getCirclefPoints(Math.floor(burshWidth / 2), Math.PI, Math.PI * 3 / 2).reverse()
  anglePoints3 = anglePoints3.map(point => ({ x: point.x + columns, y: point.y + verticalMargin * 2, angle: point.angle }))
  points = [...points, ...anglePoints3]

  for (let y = verticalMargin + 3; y < rows; y++) {
    points.push({ y, x: columns - horizontalMargin, angle: Math.PI })
    points.push({ y, x: columns - horizontalMargin, angle: Math.PI })
  }

  let anglePoints4 = getCirclefPoints(Math.floor(burshWidth / 2), Math.PI * 3 / 2, Math.PI * 4 / 2)
  anglePoints4 = anglePoints4.map(point => ({ x: point.x + columns - horizontalMargin * 2, y: point.y + rows, angle: point.angle })).reverse()
  points = [...points, ...anglePoints4]

  for (let x = columns - horizontalMargin - 3; x > startPoint.x; x--) {
    points.push({ y: rows - verticalMargin, x, angle: Math.PI / 2 })

  }
  return points
}

function removeEveryNelement(list, N = 3) {
  let newList = []
  list.forEach((point, index) => {
    if (index % N === 0) newList.push(point)
  })
  return newList;
}

function getCirclefPoints(radius, start, end) {
  const angleStep = 5
  let points = []
  for (let angle = start; angle < end; angle += (2 * Math.PI / 360) * angleStep) {
    points.push({ x: Math.cos(angle) * radius * deformationFactor, y: Math.sin(angle) * radius, angle })
  }
  return points
}

function getKeyPoints() {
  let points = []
  const halfBrushDeformed = (burshWidth * deformationFactor) / 2
  let step = 0
  while (((burshWidth / 2) * 3 + (step - 1) * burshWidth) < rows) {
    points.push([{ x: halfBrushDeformed * 2, y: (burshWidth / 2) * 2 + step * burshWidth }, { x: columns - halfBrushDeformed * 2, y: (burshWidth / 2) * 1 + step * burshWidth }])
    points.push([{ x: columns - halfBrushDeformed * 1, y: (burshWidth / 2) * 4 + step * burshWidth }, { x: halfBrushDeformed * 2, y: (burshWidth / 2) * 2 + step * burshWidth }])
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
    points.push({ x: step + startX * Xdirection, y: startY + Ystep * step, angle })
  }
  return points
}

function getBrushPoints(x, y, angle) {
  let newX = 0;
  let newY = 0;
  let points = []
  const halfBurshWidth = burshWidth / 2

  const oppositeAngle = angle + Math.PI

  for (let step = 0; step < halfBurshWidth * deformationFactor; step++) {
    newX = x + (Math.cos(angle) * (halfBurshWidth / (halfBurshWidth * deformationFactor) * step) * deformationFactor)
    newY = y + (Math.sin(angle) * (halfBurshWidth / (halfBurshWidth * deformationFactor) * step))
    points.push({ x: newX, y: newY })

    newX = x + (Math.cos(oppositeAngle) * (halfBurshWidth / (halfBurshWidth * deformationFactor) * step) * deformationFactor)
    newY = y + (Math.sin(oppositeAngle) * (halfBurshWidth / (halfBurshWidth * deformationFactor) * step))
    points.push({ x: newX, y: newY })
  }
  return points
}

function drawnStringAt(x, y, str) {
  process.stdout.cursorTo(Math.round(x), Math.round(y))
  process.stdout.write(str)
}

function drawPoints(list, character = '#') {
  list.forEach(point => {
    if (point.y <= rows - 1) drawnStringAt(point.x, point.y, character)
  })
}

startDrawing()

