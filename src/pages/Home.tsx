import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div>
      <Link to='/sign-in'>
        <Button>Sign In</Button>
      </Link>
    </div>
  )
}

export default Home
