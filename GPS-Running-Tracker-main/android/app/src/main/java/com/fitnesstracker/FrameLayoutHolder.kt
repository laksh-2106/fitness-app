package com.fitnesstracker

import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout

class FrameLayoutHolder @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {
    init {
        id = generateViewId()
    }
}
