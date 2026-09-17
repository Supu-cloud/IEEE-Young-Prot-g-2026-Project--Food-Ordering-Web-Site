import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Minus,
  Plus,
  Star,
  Store,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { FoodCard } from '../components/FoodCard'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { restaurantImageUrl } from '../core/api/imageUrl'
import { useFoodCatalogue } from '../hooks/useFoodCatalogue'
import { formatLkr } from '../services/sriLankanData'
import { useCart } from '../store/CartContext'

export function FoodDetailsPage() {
  const { id = '' } = useParams()
  const resource = useFoodCatalogue()
  const cart = useCart()

  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)

  const dish = resource.data?.dishes.find((item) => item._id === id)

  const related = useMemo(
    () =>
      (resource.data?.dishes ?? [])
        .filter(
          (item) =>
            item._id !== id &&
            item.category === dish?.category
        )
        .slice(0, 4),
    [resource.data, dish, id]
  )

  if (resource.loading) {
    return (
      <div className="page container">
        <LoadingState label="Loading dish details…" />
      </div>
    )
  }

  if (resource.error) {
    return (
      <div className="page container">
        <ErrorState
          message={resource.error}
          retry={resource.retry}
        />
      </div>
    )
  }

  if (!dish) {
    return (
      <div className="page container">
        <ErrorState message="This dish could not be found." />
      </div>
    )
  }

  const resolvedImage =
    restaurantImageUrl(dish.imageUrl) ||
    '/images/food/sri_lankan_feast.jpg'

  const add = () => {
    for (let index = 0; index < quantity; index += 1) {
      cart.addItem({
        id: dish._id,
        restaurantId: dish.restaurant,
        name: dish.name,
        description: dish.description ?? '',
        price: dish.price,
        category: dish.category,
        image: resolvedImage,
      })
    }

    setAdded(true)
  }

  return (
    <div className="page container food-detail-page">
      <Link
        className="back-link"
        to={dish.category === 'Sweets' ? '/sweets' : '/'}
      >
        <ArrowLeft />
        Back to menu
      </Link>

      <section className="food-detail">
        <div className="food-detail__image">
          <img
            src={resolvedImage}
            alt={dish.name}
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src =
                '/images/food/sri_lankan_feast.jpg'
            }}
          />

          <span>{dish.category}</span>
        </div>

        <div className="food-detail__content">
          <span className="eyebrow">
            Authentic local favourite
          </span>

          <h1>{dish.name}</h1>

          <Link
            to={`/restaurants/${dish.restaurant}`}
            className="dish-restaurant"
          >
            <Store />
            {dish.restaurantName}
          </Link>

          <div className="detail-meta">
            <span>
              <Star fill="currentColor" />
              4.8 <small>(120+)</small>
            </span>

            <span>
              <Clock3 />
              20–30 min
            </span>

            <span
              className={
                dish.available ? 'available' : 'unavailable'
              }
            >
              <CheckCircle2 />
              {dish.available
                ? 'Available today'
                : 'Unavailable'}
            </span>
          </div>

          <p className="dish-description">
            {dish.description}
          </p>

          <strong className="detail-price">
            {formatLkr(dish.price)}
          </strong>

          <div className="detail-order-controls">
            <div className="large-stepper">
              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
              >
                <Minus />
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                onClick={() =>
                  setQuantity(quantity + 1)
                }
              >
                <Plus />
              </button>
            </div>

            <button
              className="add-detail-button"
              type="button"
              onClick={add}
              disabled={!dish.available}
            >
              {added
                ? 'Added to cart'
                : `Add to cart · ${formatLkr(
                    dish.price * quantity
                  )}`}
            </button>
          </div>

          <label className="notes-field">
            <span>
              Special instructions
              <small>Optional</small>
            </span>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Less spicy, no onions, or allergy notes…"
              maxLength={180}
            />

            <small>{notes.length}/180</small>
          </label>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related-food">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                You may also like
              </span>

              <h2>
                More {dish.category.toLowerCase()}
              </h2>
            </div>
          </div>

          <div className="food-grid">
            {related.map((item) => (
              <FoodCard
                dish={item}
                key={item._id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}