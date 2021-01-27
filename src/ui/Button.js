export const Button = ({onClick, children, red}) => {

    const style = red ? 'red' : ''

    return <div onClick={onClick} className={`button ${style}`}>
        {children}
    </div>
}