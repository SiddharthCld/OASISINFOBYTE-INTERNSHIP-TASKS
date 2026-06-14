import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const pizzaVarieties = [
  {
    name: 'Margherita Classic',
    image: '/images/margherita.png',
    description: 'Fresh mozzarella, tomato sauce, and basil on a perfectly baked crust',
    price: '₹199',
  },
  {
    name: 'BBQ Chicken Supreme',
    image: '/images/bbq_chicken.png',
    description: 'Smoky BBQ sauce, grilled chicken, red onions, and cilantro',
    price: '₹349',
  },
  {
    name: 'Veggie Garden Delight',
    image: '/images/veggie.png',
    description: 'Bell peppers, mushrooms, olives, onions, and fresh tomatoes',
    price: '₹249',
  },
  {
    name: 'Pepperoni Feast',
    image: '/images/pepperoni.png',
    description: 'Loaded with double pepperoni and extra mozzarella cheese',
    price: '₹329',
  },
  {
    name: 'Four Cheese Special',
    image: '/images/four_cheese.png',
    description: 'Mozzarella, cheddar, parmesan, and gouda melted to perfection',
    price: '₹379',
  },
  {
    name: 'Spicy Mexican',
    image: '/images/spicy_mexican.png',
    description: 'Jalapeños, hot sauce, spicy chicken, corn, and peppers',
    price: '₹299',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          {/* Hero Section */}
          <div className="dashboard-hero">
            <h1>
              Hey {user?.name?.split(' ')[0]} 👋
              <br />
              <span className="text-gradient">Craft Your Perfect Pizza</span>
            </h1>
            <p>
              Choose from our premium selection or build your own masterpiece
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/build-pizza')}
            >
              🍕 Build Your Pizza
            </button>
          </div>

          {/* Pizza Varieties */}
          <h2 className="section-title">🔥 Popular Pizzas</h2>
          <div className="grid-responsive">
            {pizzaVarieties.map((pizza, index) => (
              <div
                key={index}
                className="pizza-card"
                onClick={() => navigate('/build-pizza')}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="pizza-card-image-wrapper">
                  <img src={pizza.image} alt={pizza.name} className="pizza-card-image" />
                </div>
                <h3 className="pizza-card-name">{pizza.name}</h3>
                <p className="pizza-card-desc">{pizza.description}</p>
                <p className="pizza-card-price">From {pizza.price}</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                  Customize →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
