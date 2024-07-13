export const itBool = (trueish) => (trueish ? it : it.skip)
itBool.only = (trueish) => (trueish ? it.only : it.skip)
itBool.skip = (_trueish) => it.skip
