import { OvertimeContext } from "../context/OvertimeContext";
import { useContext } from "react";


export const useOvertimeContext = () => {
	const context = useContext(OvertimeContext);

	if (!context) throw Error('useOvertimeContext must be used within a OvertimeProvider');

	return context;
}
