export function MdTable(head, align = []) {
  this.md = [head]
  this.align = head.map((h, i) => {
    const a = align[i] || ''
    // eslint-disable-next-line no-unused-vars
    let [_0, _align = 'l', spaces] = /^([rlc])?(\d+)?$/.exec(a)
    spaces = parseInt(spaces || h.length || 4, 10)
    const fn =
      _align === 'r'
        ? (s, c = ' ') => String(s).padStart(spaces, c)
        : (s, c = ' ') => String(s).padEnd(spaces, c)
    return { fn, align: _align }
  })
  this.md.push(
    this.align.map(({ fn, align }) => {
      const ch = fn('----', '-')
      if (align === 'r') {
        return ch.substr(1) + ':'
      } else if (align === 'c') {
        return ':' + ch.substr(2) + ':'
      } else {
        return ':' + ch.substr(1)
      }
    })
  )
}

MdTable.prototype.push = function push(line) {
  this.md.push(line)
}

MdTable.prototype.toString = function toString() {
  return [
    '',
    this.md
      .map((line) => {
        return [
          '| ',
          line.map((item, i) => this.align[i].fn(item)).join(' | '),
          ' |'
        ].join('')
      })
      .join('\n'),
    ''
  ].join('\n')
}
