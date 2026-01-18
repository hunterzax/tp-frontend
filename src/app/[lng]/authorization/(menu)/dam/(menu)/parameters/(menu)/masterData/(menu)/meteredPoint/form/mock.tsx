// กรองข้อมูล meter_point_type.data ตรงที่ today อยู่ในช่วง start_date กับ end_date
// ถ้า end_date = null ให้ดูแค่ start_date ผ่านหรือเท่ากับ today
const meter_point_type = [
    {
        "id": 1,
        "type": "Nomination Point",
        "data": [
            {
                "id": 228,
                "nomination_point": "RGCO",
                "description": "RGCO",
                "start_date": "2025-07-08T00:00:00.000Z",
                "end_date": null,
            },
            {
                "id": 227,
                "nomination_point": "NBK",
                "description": "NBK",
                "start_date": "2025-01-01T00:00:00.000Z",
                "end_date": null,
            },
            {
                "id": 226,
                "nomination_point": "BPK_CC1",
                "description": "For Eviden",
                "start_date": "2025-01-01T00:00:00.000Z",
                "end_date": null,
            },
        ]
    },
    {
        "id": 2,
        "type": "Non-TPA Point",
        "data": [
            {
                "id": 21,
                "non_tpa_point_name": "LMPT2-IPG",
                "description": "For Eviden",
                "start_date": "2025-01-01T00:00:00.000Z",
                "end_date": null,
            },
            {
                "id": 20,
                "non_tpa_point_name": "T2_IPG",
                "description": "test sp2",
                "start_date": "2025-01-01T00:00:00.000Z",
                "end_date": null,
            },
            {
                "id": 19,
                "non_tpa_point_name": "SP2_002",
                "description": "Test UAT SP2",
                "start_date": "2025-01-01T00:00:00.000Z",
                "end_date": "2025-07-13T00:00:00.000Z",
            },
            {
                "id": 18,
                "non_tpa_point_name": "T3_IPG",
                "description": "Non TPA",
                "start_date": "2025-01-01T00:00:00.000Z",
                "end_date": null,
            },
            {
                "id": 17,
                "non_tpa_point_name": "T2_IPG",
                "description": "Non TPA Test 01",
                "start_date": "2025-01-01T00:00:00.000Z",
                "end_date": "2025-06-19T00:00:00.000Z",
            }
        ]
    }
]