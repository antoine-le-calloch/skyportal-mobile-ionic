import "./Comments.scss"
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonText } from "@ionic/react";
import { getDateDiff } from "../../../common/common.lib.js";

/**
 * @param {Object} props
 * @param {import("../../sources.lib.js").Comment[]} props.comments
 */
export const Comments = ({comments}) => {
  /**
   * Formats the text to highlight mentions and hashtags.
   * @param {string} text - The text to format.
   */
  const formattedText = (text) =>{
    const parts = text.split(/(?<!\w)([@#][\w-@]+)/g);

    return parts.map((part, index) => {
      if (part.match(/(?<!\w)([@#][\w-@]+)/)) {
        return (
          <span key={index} className="highlight">
          {part}
        </span>
        );
      }
      return part;
    });
  }

  return (
    <div className="comments section">
      <div className="section-title section-padding">
        Comments
      </div>
      <IonAccordionGroup>
        {comments.length > 0 ? (
          <IonAccordion value="first">
            {comments.map((comment, index) => (
              <IonItem key={comment.id} color="light" slot={index > 0 ? "content" : "header"}>
              <div className="comment">
                  <IonLabel color="primary">
                    {comment.author?.username}
                    <span className="date">{" - " + getDateDiff(comment.created_at)}</span>
                  </IonLabel>
                  <div className="text">
                    {formattedText(comment.text)}
                  </div>
                </div>
              </IonItem>
            ))}
        </IonAccordion>
        ) : (
          <div className="no-comments">
            <IonText color="secondary">
              no comments found...
            </IonText>
          </div>
        )}
      </IonAccordionGroup>
    </div>
  );
}
