import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Toppings', 'Review'];

const bases = [
  { name: 'Thin Crust', emoji: '🫓', price: 99 },
  { name: 'Thick Crust', emoji: '🍞', price: 129 },
  { name: 'Cheese Burst', emoji: '🧀', price: 159 },
  { name: 'Whole Wheat', emoji: '🌾', price: 119 },
  { name: 'Gluten-Free', emoji: '🌿', price: 149 },
];

const sauces = [
  { name: 'Marinara', emoji: '🍅', price: 30 },
  { name: 'BBQ', emoji: '🔥', price: 40 },
  { name: 'Alfredo', emoji: '🥛', price: 45 },
  { name: 'Pesto', emoji: '🌿', price: 50 },
  { name: 'Hot Sauce', emoji: '🌶️', price: 35 },
];

const cheeses = [
  { name: 'Mozzarella', emoji: '🧀', price: 50 },
  { name: 'Cheddar', emoji: '🟡', price: 55 },
  { name: 'Parmesan', emoji: '🧈', price: 65 },
  { name: 'Gouda', emoji: '🟠', price: 60 },
  { name: 'Vegan Cheese', emoji: '🌱', price: 70 },
];

const veggies = [
  { name: 'Mushrooms', emoji: '🍄', price: 25 },
  { name: 'Bell Peppers', emoji: '🫑', price: 20 },
  { name: 'Onions', emoji: '🧅', price: 15 },
  { name: 'Olives', emoji: '🫒', price: 25 },
  { name: 'Tomatoes', emoji: '🍅', price: 15 },
  { name: 'Corn', emoji: '🌽', price: 20 },
  { name: 'Jalapeños', emoji: '🌶️', price: 25 },
  { name: 'Spinach', emoji: '🥬', price: 20 },
];

const meats = [
  { name: 'Pepperoni', emoji: '🥩', price: 50 },
  { name: 'Chicken', emoji: '🍗', price: 60 },
  { name: 'Sausage', emoji: '🌭', price: 55 },
  { name: 'Bacon', emoji: '🥓', price: 65 },
  { name: 'Ham', emoji: '🍖', price: 55 },
];

const PizzaBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    base: null,
    sauce: null,
    cheese: null,
    veggies: [],
    meats: [],
  });

  const selectSingle = (category, item) => {
    setSelections((prev) => ({ ...prev, [category]: item }));
  };

  const toggleMultiple = (category, item) => {
    setSelections((prev) => {
      const current = prev[category];
      const exists = current.find((i) => i.name === item.name);
      if (exists) {
        return { ...prev, [category]: current.filter((i) => i.name !== item.name) };
      }
      return { ...prev, [category]: [...current, item] };
    });
  };

  const isSelected = (category, item) => {
    if (Array.isArray(selections[category])) {
      return selections[category].some((i) => i.name === item.name);
    }
    return selections[category]?.name === item.name;
  };

  const canNext = () => {
    switch (currentStep) {
      case 0: return !!selections.base;
      case 1: return !!selections.sauce;
      case 2: return !!selections.cheese;
      case 3: return true; // toppings optional
      case 4: return true;
      default: return false;
    }
  };

  const getTotal = () => {
    let total = 0;
    if (selections.base) total += selections.base.price;
    if (selections.sauce) total += selections.sauce.price;
    if (selections.cheese) total += selections.cheese.price;
    selections.veggies.forEach((v) => (total += v.price));
    selections.meats.forEach((m) => (total += m.price));
    return total;
  };

  const handleProceedToCheckout = () => {
    const orderData = {
      items: {
        base: selections.base,
        sauce: selections.sauce,
        cheese: selections.cheese,
        veggies: selections.veggies,
        meats: selections.meats,
      },
      total: getTotal(),
    };
    sessionStorage.setItem('pizzaOrder', JSON.stringify(orderData));
    navigate('/checkout');
  };

  const renderSelectionCards = (items, category, isMulti = false) => (
    <div className="selection-grid">
      {items.map((item) => (
        <div
          key={item.name}
          className={`selection-card ${isSelected(category, item) ? 'selected' : ''}`}
          onClick={() => isMulti ? toggleMultiple(category, item) : selectSingle(category, item)}
        >
          <div className="selection-card-icon">{item.emoji}</div>
          <div className="selection-card-name">{item.name}</div>
          <div className="selection-card-price">₹{item.price}</div>
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="animate-slide-in-step">
            <h2 style={{ marginBottom: 8 }}>Choose Your Base 🫓</h2>
            <p className="text-secondary mb-xl">Select the perfect foundation for your pizza</p>
            {renderSelectionCards(bases, 'base')}
          </div>
        );
      case 1:
        return (
          <div className="animate-slide-in-step">
            <h2 style={{ marginBottom: 8 }}>Choose Your Sauce 🍅</h2>
            <p className="text-secondary mb-xl">Pick a flavorful sauce</p>
            {renderSelectionCards(sauces, 'sauce')}
          </div>
        );
      case 2:
        return (
          <div className="animate-slide-in-step">
            <h2 style={{ marginBottom: 8 }}>Choose Your Cheese 🧀</h2>
            <p className="text-secondary mb-xl">Select your cheese layer</p>
            {renderSelectionCards(cheeses, 'cheese')}
          </div>
        );
      case 3:
        return (
          <div className="animate-slide-in-step">
            <h2 style={{ marginBottom: 8 }}>Add Toppings 🥬🥩</h2>
            <p className="text-secondary mb-xl">Select as many as you like (optional)</p>

            <h3 className="section-title" style={{ fontSize: '1.1rem' }}>🥬 Veggies</h3>
            {renderSelectionCards(veggies, 'veggies', true)}

            <h3 className="section-title" style={{ fontSize: '1.1rem', marginTop: 32 }}>🥩 Meats</h3>
            {renderSelectionCards(meats, 'meats', true)}
          </div>
        );
      case 4:
        return (
          <div className="animate-slide-in-step">
            <h2 style={{ marginBottom: 8 }}>Review Your Order 📋</h2>
            <p className="text-secondary mb-xl">Make sure everything looks perfect</p>

            <div className="checkout-summary">
              {selections.base && (
                <div className="checkout-item">
                  <span>{selections.base.emoji} {selections.base.name} (Base)</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{selections.base.price}</span>
                </div>
              )}
              {selections.sauce && (
                <div className="checkout-item">
                  <span>{selections.sauce.emoji} {selections.sauce.name} (Sauce)</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{selections.sauce.price}</span>
                </div>
              )}
              {selections.cheese && (
                <div className="checkout-item">
                  <span>{selections.cheese.emoji} {selections.cheese.name} (Cheese)</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{selections.cheese.price}</span>
                </div>
              )}
              {selections.veggies.map((v) => (
                <div className="checkout-item" key={v.name}>
                  <span>{v.emoji} {v.name}</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{v.price}</span>
                </div>
              ))}
              {selections.meats.map((m) => (
                <div className="checkout-item" key={m.name}>
                  <span>{m.emoji} {m.name}</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{m.price}</span>
                </div>
              ))}
              <div className="checkout-total">
                <span>Total</span>
                <span className="price">₹{getTotal()}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 800 }}>
          {/* Progress Bar */}
          <div className="builder-progress">
            {STEPS.map((step, index) => (
              <div key={step} className="builder-step-indicator">
                {index > 0 && (
                  <div className={`builder-step-connector ${index <= currentStep ? 'active' : ''}`} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    className={`builder-step-dot ${
                      index === currentStep ? 'active' : index < currentStep ? 'completed' : ''
                    }`}
                  >
                    {index < currentStep ? <FiCheck size={14} /> : index + 1}
                  </div>
                  <span className="builder-step-label" style={{
                    color: index === currentStep ? 'var(--color-primary)' :
                      index < currentStep ? 'var(--color-success)' : 'var(--text-muted)'
                  }}>
                    {step}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Running Total */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
            padding: '10px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            margin: '0 auto var(--space-xl)',
            width: 'fit-content',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Running Total:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>₹{getTotal()}</span>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 'var(--space-2xl)',
            gap: 'var(--space-md)',
          }}>
            <button
              className="btn btn-secondary"
              onClick={() => currentStep === 0 ? navigate('/dashboard') : setCurrentStep((s) => s - 1)}
            >
              <FiArrowLeft /> Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canNext()}
              >
                Next <FiArrowRight />
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleProceedToCheckout}
                disabled={getTotal() === 0}
              >
                🍕 Proceed to Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PizzaBuilder;
