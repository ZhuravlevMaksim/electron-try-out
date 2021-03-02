export const Button = ({onClick, hide = false, children, red}) => {

    const style = red ? 'red' : ''

    return <div onClick={onClick} className={`button ${style} ${hide ? 'hidden': ''}`}>
        {children}
    </div>
}