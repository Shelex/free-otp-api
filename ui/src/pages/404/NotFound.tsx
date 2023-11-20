import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="not-found">
    <div className="not-found-container">
      <h1>404</h1>
      <p>Page Not Found</p>
      <p>
        <Link to={'/'}>Go to countries list</Link>
      </p>
    </div>
  </section>
);

export default NotFound;
