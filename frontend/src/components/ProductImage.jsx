import { API_BASE_URL } from '../api'

/**
 * Renders an uploaded product image, or a "No image" placeholder box
 * if the product has no image_url yet.
 *
 * image_url is stored as a relative path like "/static/uploads/xyz.jpg" -
 * this prefixes it with the backend's origin so <img> can load it.
 */
export default function ProductImage({ src, alt, className = '' }) {
  if (!src) {
    return <div className={`no-image-box ${className}`}>No image</div>
  }
  return <img src={`${API_BASE_URL}${src}`} alt={alt} className={className} />
}
