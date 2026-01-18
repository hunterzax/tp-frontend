// master/allocation/curtailments-allocation-calc?gasDay=25/04/2025&area=Y&nominationPoint=Yadana&unit=MMSCFD&type=1&maxCapacity=50000
export const mock_data_cal = [
    {
        "calcHv": 8480.928966964622,
        "nominationValue": 8532,
        "maxCapacity": 50000,
        "term": "firm",
        "gasDayUse": "25/04/2025",
        "shipper_name": "B.GRIMM",
        "contract": "2025-CMT-011",
        "area_text": "Y",
        "remainingCapacity": 8532
    },
    {
        "calcHv": 1.8333333333333333,
        "nominationValue": 64.80000000000001,
        "maxCapacity": 50000,
        "term": "firm",
        "gasDayUse": "25/04/2025",
        "shipper_name": "B.GRIMM",
        "contract": "2025-CMT-022",
        "area_text": "Y",
        "remainingCapacity": 64.80000000000001
    }
]


// GET NOMPOINT by AREA (tab nomination)
// master/allocation/select-nomination?area=Y

export const res_nom_point = [
    "Yadana",
    "Yetagun",
    "Zawtika",
    "TEST-1"
]



// master/allocation/curtailments-allocation?type=1
export const mock_data_table_type_one = [
    {
        "id": 18,
        "case_id": "20250506-CAN-0001",
        "gas_day": "2025-04-25T00:00:00.000Z",
        "gas_day_text": "25/04/2025",
        "area": "Y",
        "nomination_point": null,
        "unit": "MMSCFD",
        "max_capacity": "50000",
        "active": null,
        "create_date": "2025-05-06T13:50:59.676Z",
        "update_date": null,
        "create_date_num": 1746539459,
        "update_date_num": null,
        "create_by": 99999,
        "update_by": null,
        "curtailments_allocation_type_id": 1,
        "curtailments_allocation_type": {
            "id": 1,
            "type": "Area",
            "active": null,
            "create_date": null,
            "update_date": null,
            "create_date_num": null,
            "update_date_num": null,
            "create_by": null,
            "update_by": null
        },
        "curtailments_allocation_calc": [
            {
                "id": 35,
                "gas_day": "2025-04-25T00:00:00.000Z",
                "gas_day_text": "25/04/2025",
                "calc_hv": 8480,
                "nomination_value": 8532,
                "max_capacity": null,
                "term": "firm",
                "shipper_name": "B.GRIMM",
                "contract": "2025-CMT-011",
                "area_text": "Y",
                "remaining_capacity": 8532,
                "active": null,
                "create_date": "2025-05-06T13:50:59.676Z",
                "update_date": null,
                "create_date_num": 1746539459,
                "update_date_num": null,
                "create_by": 99999,
                "update_by": null,
                "curtailments_allocation_id": 18,
                "create_by_account": {
                    "id": 99999,
                    "email": "admin.nx@nueamek.fun",
                    "first_name": "nx",
                    "last_name": "solution"
                },
                "update_by_account": null
            },
            {
                "id": 36,
                "gas_day": "2025-04-25T00:00:00.000Z",
                "gas_day_text": "25/04/2025",
                "calc_hv": 1,
                "nomination_value": 64,
                "max_capacity": null,
                "term": "firm",
                "shipper_name": "B.GRIMM",
                "contract": "2025-CMT-022",
                "area_text": "Y",
                "remaining_capacity": 64,
                "active": null,
                "create_date": "2025-05-06T13:50:59.676Z",
                "update_date": null,
                "create_date_num": 1746539459,
                "update_date_num": null,
                "create_by": 99999,
                "update_by": null,
                "curtailments_allocation_id": 18,
                "create_by_account": {
                    "id": 99999,
                    "email": "admin.nx@nueamek.fun",
                    "first_name": "nx",
                    "last_name": "solution"
                },
                "update_by_account": null
            }
        ],
        "create_by_account": {
            "id": 99999,
            "email": "admin.nx@nueamek.fun",
            "first_name": "nx",
            "last_name": "solution"
        },
        "update_by_account": null
    }
]

// master/allocation/curtailments-allocation?type=2
export const mock_data_table_type_two = [
    {
        "id": 19,
        "case_id": "20250506-CAN-0002",
        "gas_day": "2025-04-25T00:00:00.000Z",
        "gas_day_text": "25/04/2025",
        "area": "Y",
        "nomination_point": "Yadana",
        "unit": "MMSCFD",
        "max_capacity": "50000",
        "active": null,
        "create_date": "2025-05-06T14:03:00.209Z",
        "update_date": null,
        "create_date_num": 1746540180,
        "update_date_num": null,
        "create_by": 99999,
        "update_by": null,
        "curtailments_allocation_type_id": 2,
        "curtailments_allocation_type": {
            "id": 2,
            "type": "Nomination Point",
            "active": null,
            "create_date": null,
            "update_date": null,
            "create_date_num": null,
            "update_date_num": null,
            "create_by": null,
            "update_by": null
        },
        "curtailments_allocation_calc": [
            {
                "id": 37,
                "gas_day": "2025-04-25T00:00:00.000Z",
                "gas_day_text": "25/04/2025",
                "calc_hv": 8480,
                "nomination_value": 2052,
                "max_capacity": null,
                "term": "firm",
                "shipper_name": "B.GRIMM",
                "contract": "2025-CMT-011",
                "area_text": "Y",
                "remaining_capacity": 2052,
                "active": null,
                "create_date": "2025-05-06T14:03:00.209Z",
                "update_date": null,
                "create_date_num": 1746540180,
                "update_date_num": null,
                "create_by": 99999,
                "update_by": null,
                "curtailments_allocation_id": 19,
                "create_by_account": {
                    "id": 99999,
                    "email": "admin.nx@nueamek.fun",
                    "first_name": "nx",
                    "last_name": "solution"
                },
                "update_by_account": null
            },
            {
                "id": 38,
                "gas_day": "2025-04-25T00:00:00.000Z",
                "gas_day_text": "25/04/2025",
                "calc_hv": 2,
                "nomination_value": 21,
                "max_capacity": null,
                "term": "firm",
                "shipper_name": "B.GRIMM",
                "contract": "2025-CMT-022",
                "area_text": "Y",
                "remaining_capacity": 21,
                "active": null,
                "create_date": "2025-05-06T14:03:00.209Z",
                "update_date": null,
                "create_date_num": 1746540180,
                "update_date_num": null,
                "create_by": 99999,
                "update_by": null,
                "curtailments_allocation_id": 19,
                "create_by_account": {
                    "id": 99999,
                    "email": "admin.nx@nueamek.fun",
                    "first_name": "nx",
                    "last_name": "solution"
                },
                "update_by_account": null
            }
        ],
        "create_by_account": {
            "id": 99999,
            "email": "admin.nx@nueamek.fun",
            "first_name": "nx",
            "last_name": "solution"
        },
        "update_by_account": null,
        "areaObj": {
            "id": 31,
            "name": "Y",
            "create_date": "2024-12-05T15:59:49.095Z",
            "update_date": null,
            "create_date_num": 1733389189,
            "update_date_num": null,
            "create_by": 99999,
            "update_by": null,
            "active": true,
            "start_date": "2024-12-05T00:00:00.000Z",
            "end_date": "2031-12-05T00:00:00.000Z",
            "description": "area y",
            "area_nominal_capacity": 550000,
            "zone_id": 30,
            "entry_exit_id": 1,
            "color": "#c8ff8d",
            "supply_reference_quality_area": null
        }
    }
]