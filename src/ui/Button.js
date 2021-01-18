export const Button = ({onClick, children}) => {
    return <div onClick={onClick} className='button'>
        {children}
    </div>
}