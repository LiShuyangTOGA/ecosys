import styles from './Panel.module.css';

export default function Panel({ title, onClose, children, width = 420 }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span>{title}</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}