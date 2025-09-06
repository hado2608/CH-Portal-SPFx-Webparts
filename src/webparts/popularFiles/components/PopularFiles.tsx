import * as React from 'react';
import styles from './PopularFiles.module.scss';

interface IPopularFileItem {
  FileName: string;
  Department: string;
  URL: { Description: string; Url: string };
}

interface IPopularFilesProps {
  items: IPopularFileItem[];
}

const PopularFiles: React.FC<IPopularFilesProps> = ({ items }) => {
  const visible = (items || []).filter(i => i?.FileName && i?.URL?.Url);

  return (
    <div className={styles.popularFiles}>
      <div className={styles.columnLabels}>
        <span className={styles.nameLabel}>Name</span>
        <span className={styles.deptLabel}>Department</span>
        <div className={styles.chevronPlaceholder} />
      </div>

      {visible.length === 0 ? (
        <div>No files configured yet.</div>
      ) : (
        <ul>
          {visible.map(item => (
            <li key={item.FileName} className={styles.fileWrapper}>
              <a target="_blank" data-interception="off" rel="noopener noreferrer" href={item.URL.Url} className={styles.file3D}>
                <div className={styles.fileContent}>
                  <div className={styles.fileText}>
                    <div className={styles.fileName}>{item.FileName}</div>
                    <div className={styles.department}>{item.Department}</div>
                  </div>

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 21L16.5 12L7.5 3"
                      stroke="#015137"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </a>
              <div className={styles.fileShadow} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PopularFiles;
