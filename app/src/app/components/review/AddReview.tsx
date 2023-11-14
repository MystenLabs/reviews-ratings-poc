import {
  Button,
  Label,
  Modal,
  RangeSlider,
  Textarea,
  TextInput,
} from "flowbite-react";
import React, {useState} from "react";

interface AddReviewProps {
  serviceId: string;
  poeId?: string;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  onSubmitReview: (reviewBody: string, overallRate: string) => void;
}

export const AddReview = ({
  serviceId,
  poeId,
  openModal,
  setOpenModal,
  onSubmitReview,
}: AddReviewProps) => {
  const [reviewBody, setReviewBody] = useState("");
  const [overallRate, setOverallRate] = useState("3");

  return (
    <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>Write a New Review</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <div>
            <div className="mb-2 block">
              <Label>Service ID</Label>
            </div>
            <TextInput id="serviceId" value={serviceId} disabled />
          </div>
          {!!poeId && (
            <div>
              <div className="mb-2 block">
                <Label>NFT ID (Proof of Ownership)</Label>
              </div>
              <TextInput id="poeId" value={poeId} disabled />
            </div>
          )}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="reviewBody" value="Content" />
            </div>
            <Textarea
              id="reviewBody"
              placeholder="Leave a review"
              value={reviewBody}
              onChange={(event) => setReviewBody(event.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label value={`Overall Rate: ${overallRate}`} />
            </div>
            <RangeSlider
              id="overallRate"
              min="0"
              max="5"
              step="1"
              onChange={(event) => setOverallRate(event.target.value)}
              className="w-2/5"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setOpenModal(false);
            onSubmitReview(reviewBody, overallRate);
          }}
        >
          Submit
        </Button>
        <Button color="gray" onClick={() => setOpenModal(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
