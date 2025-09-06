import * as React from 'react';
import { useEffect, useState } from 'react';
import { sp } from '@pnp/sp/presets/all';
import styles from './ReportOudatedFiles.module.scss';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { HttpClient, IHttpClientOptions } from '@microsoft/sp-http';

interface Props {
  context: ListViewCommandSetContext;
  isMarkingMode: boolean;
  setIsMarkingMode: (val: boolean) => void;
  onClose: () => void;
}

interface FileItem {
  fileName: string;
  fileUrl: string;
  fileId: number;
  ownerEmail: string;
  ownerName: string;
  lastModified: string;
  fileExtension: string;
}

const ReportOutdatedFiles: React.FC<Props> = ({ context, isMarkingMode, setIsMarkingMode, onClose }) => {
  const [outdatedFiles, setOutdatedFiles] = useState<FileItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOutdatedFiles = async (): Promise<void> => {
    try {
      const items = await sp.web.lists
        .getByTitle("Documents")
        .items
        .select("Id", "FileLeafRef", "FileRef", "Modified", "Author/EMail", "Author/Title", "Outdated")
        .expand("Author")
        .filter("Outdated eq 1")
        .top(50)
        .get();

      const formatted: FileItem[] = items.map(i => {
        const name = i.FileLeafRef;
        const extension = name?.split('.').pop()?.toLowerCase() || 'file';

        return {
          fileName: name,
          fileUrl: i.FileRef,
          fileId: i.Id,
          ownerEmail: i.Author?.EMail,
          ownerName: i.Author?.Title,
          lastModified: i.Modified,
          fileExtension: extension
        };
      });

      setOutdatedFiles(formatted);
    } catch (err) {
      console.error("Error loading files", err);
    }
  };

  useEffect(() => {
    if (!isMarkingMode) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sp.setup({ spfxContext: context as any });
    loadOutdatedFiles().catch(console.error);
    const interval = setInterval(loadOutdatedFiles, 10000);
    return () => clearInterval(interval);
  }, [isMarkingMode]);

  const removeFile = async (id: number): Promise<void> => {
    try {
      await sp.web.lists.getByTitle("Documents").items.getById(id).update({ Outdated: false });
      setOutdatedFiles(prev => prev.filter(f => f.fileId !== id));
    } catch (err) {
      console.error("Error updating item", err);
    }
  };

  const submitReport = async (): Promise<void> => {
    if (outdatedFiles.length === 0) return;

    const payload = JSON.stringify({ files: outdatedFiles });
    const url = "https://prod-191.westus.logic.azure.com:443/workflows/e1ce7098bb0f4a7e8bea7ff94d817bb3/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=K-jbCnxKA0WPSfKwcEuA31VQ6a1sCih0CkGCpFw4a3Y"; // your full URL here

    const options: IHttpClientOptions = {
      headers: { 'Content-Type': 'application/json' },
      body: payload
    };

    try {
      const response = await context.httpClient.post(url, HttpClient.configurations.v1, options);
      const text = await response.text();
      console.log("📨 Response text:", text);

      if (response.ok) {
        setToastMessage(`✅ You reported ${outdatedFiles.length} file(s) as outdated.`);
        setOutdatedFiles([]);
      } else {
        setToastMessage("❌ Failed to submit report.");
      }
    } catch (err) {
      console.error("Submit error", err);
      setToastMessage("❌ Network error while sending report.");
    }
  };

  const handleClose = (): void => {
    setIsMarkingMode(false);
    setToastMessage(null);
    onClose();
  };

  if (!isMarkingMode || outdatedFiles.length === 0) return null;

  const uniqueEmails = Array.from(new Set(outdatedFiles.map(f => f.ownerEmail)));
  const shown = uniqueEmails.slice(0, 2);
  const remainingCount = uniqueEmails.length - shown.length;

  return (
    <>
      <div className={styles.popup}>
        <button className={styles.closeBtn} onClick={handleClose}>×</button>
        <h4>🗂️ Marked Outdated Files</h4>
        <p className={styles.instructions}>
          <li>Hover over each file and click the little circle on the left.</li>
          <li>You can pick as many as you need.</li>
          <li>Then send your report when you&apos;re ready!</li>
        </p>

        <div className={styles.divider} />
        <p className={styles.summary}>You are marking {outdatedFiles.length} file{outdatedFiles.length > 1 ? 's' : ''} as outdated</p>
        <p className={styles.recipients}>
          Emailing <strong>{shown.join(', ')}</strong>
          {remainingCount > 0 && <> and <strong>{remainingCount} more</strong></>}
        </p>

        <ul className={styles.fileList}>
          {outdatedFiles.map(f => (
            <li key={f.fileId} className={styles.fileItem}>
              <div className={styles.fileRow}>
                <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">{f.fileName}</a>
                <button className={styles.removeBtn} onClick={() => removeFile(f.fileId)}>×</button>
              </div>
            </li>
          ))}
        </ul>

        <button className={styles.button} onClick={submitReport}>📤 Send Report</button>
      </div>

      {toastMessage && (
        <div className={styles.toast}>
          {toastMessage}
          <button className={styles.toastClose} onClick={handleClose}>×</button>
        </div>
      )}
    </>
  );
};

export default ReportOutdatedFiles;