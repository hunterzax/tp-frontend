"use client";
import { fetchAllocationModeMaster } from '@/utils/store/slices/allocationModeSlice';
import { fetchAllocationStatusMaster } from '@/utils/store/slices/allocationStatusSlice';
import { fetchAreaMaster } from '@/utils/store/slices/areaMasterSlice';
import { fetchAuditLogModule } from '@/utils/store/slices/auditLogSlice';
import { fetchContractPoint } from '@/utils/store/slices/contractPointSlice';
import { fetchEmailNotiMgn } from '@/utils/store/slices/emailNotiMgnSlice';
import { fetchEntryExit } from '@/utils/store/slices/entryExitSlice';
import { fetchNominationPoint } from '@/utils/store/slices/nominationPointSlice';
import { fetchNomStatMaster } from '@/utils/store/slices/nominationStatusSlice';
import { fetchNominationType } from '@/utils/store/slices/nominationTypeSlice';
import { fetchProcessType } from '@/utils/store/slices/processTypeSlice';
import { fetchShipperGroup } from '@/utils/store/slices/shipperGroupSlice';
import { fetchStatCapReqMgnMaster } from '@/utils/store/slices/statusCapReqMgnSlice';
import { fetchSystemParamModule } from '@/utils/store/slices/systemParamModuleSlice';
import { fetchSystemParamMaster } from '@/utils/store/slices/systemParamSlice';
import { fetchTermType } from '@/utils/store/slices/termTypeMasterSlice';
import { fetchTypeConceptPoint } from '@/utils/store/slices/typeConceptPointSlice';
import { fetchUserGuideRoleAll } from '@/utils/store/slices/userGuideRoleAllSlice';
import { fetchUserType } from '@/utils/store/slices/userTypeMasterSlice';
import { fetchZoneMasterSlice } from '@/utils/store/slices/zoneMasterSlice';
import { RootState, useAppDispatch } from '@/utils/store/store';
import { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

export const useFetchMasters = (forceRefetch = false) => {
    const dispatch = useAppDispatch();

    const entryExitMaster = useSelector((state: RootState) => state.entryexit);
    const zoneMaster = useSelector((state: RootState) => state.zonemaster);
    const typeConceptPoint = useSelector((state: RootState) => state.typeconceptpoint);
    const shipperGroupData = useSelector((state: RootState) => state.shippergroup);
    const areaMaster = useSelector((state: RootState) => state.areamaster);
    const nominationPointData = useSelector((state: RootState) => state.nompoint);
    const contractPointData = useSelector((state: RootState) => state.contractpoint);
    const termTypeMaster = useSelector((state: RootState) => state.termtype);
    const auditLogModule = useSelector((state: RootState) => state.auditlogmodule);
    const emailNotiMgn = useSelector((state: RootState) => state.emailnotimgn);
    const processTypeMaster = useSelector((state: RootState) => state.processtype);
    const nominationTypeMaster = useSelector((state: RootState) => state.nominationtype);
    const userTypeMaster = useSelector((state: RootState) => state.usertype);
    const sysParamModule = useSelector((state: RootState) => state.sysparammodule);
    const sysParamMaster = useSelector((state: RootState) => state.systemparam);
    const userGuideRole = useSelector((state: RootState) => state.userguiderole);
    const statCapReqMgn = useSelector((state: RootState) => state.statcapreqmgn);
    const nominationStatMaster = useSelector((state: RootState) => state.nomstatmaster);
    const allocationModeMaster = useSelector((state: RootState) => state.allocationmodemaster);
    const allocationStatusMaster = useSelector((state: RootState) => state.allocationstatusmaster);

    // Fetch data if not present, or forceRefetch is true
    const fetchData = useCallback(() => {
        if (!entryExitMaster?.data || forceRefetch) {
            dispatch(fetchEntryExit());
        }
        if (!zoneMaster?.data || forceRefetch) {
            dispatch(fetchZoneMasterSlice());
        }
        if (!areaMaster?.data || forceRefetch) {
            dispatch(fetchAreaMaster());
        }
        if (!shipperGroupData?.data || forceRefetch) {
            dispatch(fetchShipperGroup());
        }
        if (!typeConceptPoint?.data || forceRefetch) {
            dispatch(fetchTypeConceptPoint());
        }
        if (!nominationPointData?.data || forceRefetch) {
            dispatch(fetchNominationPoint());
        }
        if (!contractPointData?.data || forceRefetch) {
            dispatch(fetchContractPoint());
        }
        if (!termTypeMaster?.data || forceRefetch) {
            dispatch(fetchTermType());
        }
        if (!auditLogModule?.data || forceRefetch) {
            dispatch(fetchAuditLogModule());
        }
        if (!emailNotiMgn?.data || forceRefetch) {
            dispatch(fetchEmailNotiMgn());
        }
        if (!processTypeMaster?.data || forceRefetch) {
            dispatch(fetchProcessType());
        }
        if (!nominationTypeMaster?.data || forceRefetch) {
            dispatch(fetchNominationType());
        }
        if (!userTypeMaster?.data || forceRefetch) {
            dispatch(fetchUserType());
        }
        if (!sysParamModule?.data || forceRefetch) {
            dispatch(fetchSystemParamModule());
        }
        if (!sysParamMaster?.data || forceRefetch) {
            dispatch(fetchSystemParamMaster());
        }
        if (!userGuideRole?.data || forceRefetch) {
            dispatch(fetchUserGuideRoleAll());
        }
        if (!statCapReqMgn?.data || forceRefetch) {
            dispatch(fetchStatCapReqMgnMaster());
        }
        if (!nominationStatMaster?.data || forceRefetch) {
            dispatch(fetchNomStatMaster());
        }
        if (!allocationModeMaster?.data || forceRefetch) {
            dispatch(fetchAllocationModeMaster());
        }
        if (!allocationStatusMaster?.data || forceRefetch) {
            dispatch(fetchAllocationStatusMaster());
        }
    }, [dispatch, entryExitMaster, zoneMaster, typeConceptPoint, shipperGroupData, areaMaster, nominationPointData, contractPointData, termTypeMaster, auditLogModule, emailNotiMgn, processTypeMaster, userTypeMaster, nominationTypeMaster, sysParamModule, sysParamMaster, userGuideRole, statCapReqMgn, nominationStatMaster, allocationModeMaster, allocationStatusMaster, forceRefetch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Optional: Provide a function to manually trigger refetch
    const refetch = () => fetchData();

    return { entryExitMaster, zoneMaster, typeConceptPoint, shipperGroupData, areaMaster, nominationPointData, contractPointData, termTypeMaster, auditLogModule, emailNotiMgn, processTypeMaster, userTypeMaster, nominationTypeMaster, sysParamModule, sysParamMaster, userGuideRole, statCapReqMgn, nominationStatMaster, allocationModeMaster, allocationStatusMaster, refetch };
};
