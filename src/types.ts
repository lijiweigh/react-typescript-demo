export interface SquareProps {
  value: string | null
  onClick: Function
}

export interface SquareState {
  value: string
}

export interface BoardState {
  squares: string[] | null[]
  XIsNext: boolean
}
