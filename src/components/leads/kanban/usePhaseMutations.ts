
import { useLeadPhaseMutation } from "./mutations/useLeadPhaseMutation";
import { useAddPhaseMutation } from "./mutations/useAddPhaseMutation";
import { usePhaseNameMutation } from "./mutations/usePhaseNameMutation";
import { useDeletePhaseMutation } from "./mutations/useDeletePhaseMutation";
import { usePhaseOrderMutation } from "./mutations/usePhaseOrderMutation";

export const usePhaseMutations = () => {
  const updateLeadPhase = useLeadPhaseMutation();
  const addPhase = useAddPhaseMutation();
  const updatePhaseName = usePhaseNameMutation();
  const deletePhase = useDeletePhaseMutation();
  const updatePhaseOrder = usePhaseOrderMutation();

  return {
    updateLeadPhase,
    addPhase,
    updatePhaseName,
    deletePhase,
    updatePhaseOrder
  };
};
