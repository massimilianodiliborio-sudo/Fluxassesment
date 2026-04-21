import { useState } from 'react';
import {
    IPPS_ITEMS, TIPI_ITEMS, MIS_ITEMS, ERQ_ITEMS, PPS_ITEMS,
    CFQ_ITEMS, BNSSS_ITEMS, SEQ_ITEMS, MTS_ITEMS, CT_ITEMS, PESD_ITEMS
} from '../constants';
import { AssessmentRecord } from '../types';

const defaultIpps  = () => new Array(IPPS_ITEMS.length).fill(3);
const defaultTipi  = () => new Array(TIPI_ITEMS.length).fill(4);
const defaultMis   = () => new Array(MIS_ITEMS.length).fill(3);
const defaultErq   = () => new Array(ERQ_ITEMS.length).fill(4);
const defaultPps   = () => new Array(PPS_ITEMS.length).fill(4);
const defaultCfq   = () => new Array(CFQ_ITEMS.length).fill(3);
const defaultBnsss = () => new Array(BNSSS_ITEMS.length).fill(4);
const defaultSeq   = () => new Array(SEQ_ITEMS.length).fill(2);
const defaultMts   = () => new Array(MTS_ITEMS.length).fill(3);
const defaultCt    = () => new Array(CT_ITEMS.length).fill(4);
const defaultPesd  = () => new Array(PESD_ITEMS.length).fill(0);

export const useQuestionnaireState = () => {
    const [ippsData,  setIppsData]  = useState<number[]>(defaultIpps);
    const [tipiData,  setTipiData]  = useState<number[]>(defaultTipi);
    const [misData,   setMisData]   = useState<number[]>(defaultMis);
    const [erqData,   setErqData]   = useState<number[]>(defaultErq);
    const [ppsData,   setPpsData]   = useState<number[]>(defaultPps);
    const [cfqData,   setCfqData]   = useState<number[]>(defaultCfq);
    const [bnsssData, setBnsssData] = useState<number[]>(defaultBnsss);
    const [seqData,   setSeqData]   = useState<number[]>(defaultSeq);
    const [mtsData,   setMtsData]   = useState<number[]>(defaultMts);
    const [ctData,    setCtData]    = useState<number[]>(defaultCt);
    const [pesdData,  setPesdData]  = useState<number[]>(defaultPesd);

    const loadFromRecord = (record: AssessmentRecord) => {
        setIppsData(record.ipps  || []);
        setTipiData(record.tipi  || []);
        setMisData(record.mis    || []);
        setErqData(record.erq    || []);
        setPpsData(record.pps    || []);
        setCfqData(record.cfq    || []);
        setBnsssData(record.bnsss || []);
        setSeqData(record.seq    || []);
        setMtsData(record.mts    || []);
        setCtData(record.ct      || []);
        setPesdData(record.pesd  || []);
    };

    const resetAll = () => {
        setIppsData(defaultIpps());
        setTipiData(defaultTipi());
        setMisData(defaultMis());
        setErqData(defaultErq());
        setPpsData(defaultPps());
        setCfqData(defaultCfq());
        setBnsssData(defaultBnsss());
        setSeqData(defaultSeq());
        setMtsData(defaultMts());
        setCtData(defaultCt());
        setPesdData(defaultPesd());
    };

    return {
        ippsData,  tipiData,  misData,   erqData,   ppsData,
        cfqData,   bnsssData, seqData,   mtsData,   ctData,   pesdData,
        setIppsData,  setTipiData,  setMisData,   setErqData,   setPpsData,
        setCfqData,   setBnsssData, setSeqData,   setMtsData,   setCtData,   setPesdData,
        loadFromRecord,
        resetAll,
    };
};
