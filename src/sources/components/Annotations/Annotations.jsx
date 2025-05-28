import "./Annotations.scss";
import { AnnotationItem } from "../AnnotationItem/AnnotationItem.jsx";

/**
 * @param {Object} props
 * @param {import("../../../scanning/scanning.lib.js").Candidate | import("../../sources.lib.js").Source} props.source
 * @returns {JSX.Element}
 */
export const Annotations = ({ source }) => {
  return (
    <div className="annotations">
      {source.annotations.map((annotation) => (
        <AnnotationItem key={annotation.id} annotation={annotation} />
      ))}
    </div>
  );
};
