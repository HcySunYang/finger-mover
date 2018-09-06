export const requestAnim = requestAnimationFrame || webkitRequestAnimationFrame
export const cancelAnim = cancelAnimationFrame || webkitCancelAnimationFrame

export function throwError (text) {
    throw new TypeError(text)
}

export function toArray (data) {
    if (!Array.isArray(data)) {
        return Array.prototype.slice.call(data)
    }
    return data
}

export function parentNode (el) {
    return el.parentNode
}

export function getStyle (el, prototype) {
    return document.defaultView.getComputedStyle(el, null)[prototype]
}

export function now () {
    return Date.now()
}

export function extend (to, ...from) {
    from.forEach((f) => {
        for (let attr in f) {
            to[attr] = f[attr]
        }
    })
    
    return to
}
export function cssText (el, cssText) {
    el.style.cssText = el.style.cssText + ' ' + cssText
}

export function getRelativeRect (parent, child) {
    let pos = {
        top: 0,
        left: 0
    }
    while (child !== parent) {
        pos.top += child.offsetTop
        pos.left += child.offsetLeft
        child = child.offsetParent
    }
    return pos
}

export function isInElement (parent, child) {
    let num = parent.compareDocumentPosition(child)

    if (num === 0 || num === 20) {
        return true
    }
    return false
}

export function is3DMatrix (el) {
    let matrix = getStyle(el, 'WebkitTransform')
    if (!matrix || matrix === 'none') {
        return false
    }
    let matrixArray = matrix.match(/[+-]?\d*[.]?\d+(?=,|\))/g)
    if (matrixArray.length > 6) {
        return true
    }
    return false
}

export function transform (el, attr, val) {
    let transString = ''

    el.transform = el.transform ? el.transform : Object.create(null)
    el.transform[attr] = val

    for (let a in el.transform) {
        switch (a) {
            case 'translateX':
            case 'translateY':
            case 'translateZ':
                transString += `${a}(${el.transform[a]}px) `
                break
            case 'scaleX':
            case 'scaleY':
            case 'scaleZ':
                transString += `${a}(${el.transform[a]}) `
                break
            case 'rotateX':
            case 'rotateY':
            case 'rotateZ':
            case 'skewX':
            case 'skewY':
                transString += `${a}(${el.transform[a]}deg) `
                break
        }
    }
    cssText(el, `transform: ${transString}; -webkit-transform: ${transString};`)
}

export function getPropFromMatrix (el) {
    let matrix = getStyle(el, 'WebkitTransform')

    if (!matrix || matrix === 'none') {
        transform(el, 'translateZ', 0.01)
    }
    /* The element's dispaly attribute value is none */
    if (matrix === 'none') {
        return {}
    }
    try {
        matrix = getStyle(el, 'WebkitTransform')
            .match(/[+-]?\d*[.]?\d+(?=,|\))/g)
            .map((o) => {
                return parseInt(o)
            })
    } catch (e) {}
    
    let matrixLen = matrix.length
    let matrixObject = {}
    let is3D = matrixLen > 6

    matrixObject.translateX = is3D ? matrix[12] : matrix[4]
    matrixObject.translateY = is3D ? matrix[13] : matrix[5]
    matrixObject.translateZ = is3D ? matrix[14] : 0

    matrixObject.scaleX = typeof el.transform['scaleX'] !== 'undefined' 
                            ? el.transform['scaleX']
                            : 1
    matrixObject.scaleY = typeof el.transform['scaleY'] !== 'undefined'
                            ? el.transform['scaleY']
                            : 1
    matrixObject.scaleZ = typeof el.transform['scaleZ'] !== 'undefined'
                            ? el.transform['scaleZ']
                            : 1

    matrixObject.rotateX = typeof el.transform['rotateX'] !== 'undefined'
                            ? el.transform['rotateX'] : 0
    matrixObject.rotateY = typeof el.transform['rotateY'] !== 'undefined'
                            ? el.transform['rotateY'] : 0
    matrixObject.rotateZ = typeof el.transform['rotateZ'] !== 'undefined'
                            ? el.transform['rotateZ'] : 0

    matrixObject.skewX = typeof el.transform['skewX'] !== 'undefined'
                            ? el.transform['skewX'] : 0
    matrixObject.skewY = typeof el.transform['skewY'] !== 'undefined'
                            ? el.transform['skewY'] : 0

    return matrixObject
}

export function getAbsMaxFromArray (arr) {
    let tempArr = arr.map((o) => {
        return Math.abs(o)
    })
    let maxIndex = tempArr.indexOf(Math.max.apply(null, tempArr))
    return arr[maxIndex]
}