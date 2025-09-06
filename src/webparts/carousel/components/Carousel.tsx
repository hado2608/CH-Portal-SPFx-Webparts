import * as React from 'react';
import styles from './Carousel.module.scss';
import { ICarouselItem } from './ICarouselItem';

interface CarouselProps {
  items: ICarouselItem[];
}

const Carousel = ({ items }: CarouselProps): React.ReactElement => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  const delay = 5000;

  const resetTimeout = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  React.useEffect(() => {
    if (!isPaused && items?.length) {
      resetTimeout();
      timeoutRef.current = window.setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === items.length - 1 ? 0 : prevIndex + 1
        );
      }, delay);
    }

    return () => resetTimeout();
  }, [currentIndex, isPaused, items]);

  const goToSlide = (index: number): void => {
    setCurrentIndex(index);
    setIsPaused(true);
  };

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
    setIsPaused(true);
  };

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
    setIsPaused(true);
  };

  if (!items || items.length === 0) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.emptyState}>No upcoming events.</div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.heading}>🗓️ Upcoming Events</div>
      <div className={styles.carousel}>
        {items.map((item, index) => (
          <a
            key={index}
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
            href={item.linkUrl}
            target="_blank"
            data-interception="off"
            rel="noopener noreferrer"
            onClick={() => setIsPaused(true)}
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          >
            {(item.title) ? (
              <>
                <div className={styles.overlay} />
                <div className={styles.captionTwoColumn}>
                  <div className={styles.leftColumn}>
                    {item.date && <div className={styles.date}>{item.date}</div>}
                    {item.day && <div className={styles.day}>{item.day}</div>}
                  </div>
                  <div className={styles.rightColumn}>
                    {item.title && <h2>{item.title}</h2>}
                    {item.time && <div className={styles.time}>{item.time}</div>}
                    {item.location && <div className={styles.location}>{item.location}</div>}
                  </div>
                </div>
              </>
            ) : null}
          </a>
        ))}
        <button className={styles.prev} onClick={prevSlide}>&#10094;</button>
        <button className={styles.next} onClick={nextSlide}>&#10095;</button>
      </div>
      <div className={styles.dots}>
        {items.map((_, idx) => (
          <span
            key={idx}
            className={`${styles.dot} ${currentIndex === idx ? styles.active : ''}`}
            onClick={() => goToSlide(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
